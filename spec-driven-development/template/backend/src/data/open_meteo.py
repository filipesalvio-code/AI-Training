from __future__ import annotations

import os

import httpx

from src.errors import AppError, weather_unavailable_error
from src.models.weather import Coordinates, ProviderConditions, ResolvedLocation
from src.services.weather_condition import get_weather_condition, is_known_weather_code

DEFAULT_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
DEFAULT_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CURRENT_FIELDS = "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m"
EXPECTED_UNITS = {"temperature": "°C", "humidity": "%", "wind": "km/h"}


class OpenMeteoClient:
    def __init__(
        self,
        geocoding_url: str | None = None,
        forecast_url: str | None = None,
        client: httpx.AsyncClient | None = None,
        timeout_ms: int | None = None,
    ):
        self._geocoding_url = geocoding_url or os.getenv("OPEN_METEO_GEOCODING_URL", DEFAULT_GEOCODING_URL)
        self._forecast_url = forecast_url or os.getenv("OPEN_METEO_FORECAST_URL", DEFAULT_FORECAST_URL)
        self._client = client
        self._timeout_ms = timeout_ms or int(os.getenv("OPEN_METEO_TIMEOUT_MS", "2500"))

    async def search_first_location(self, city: str) -> ResolvedLocation | None:
        params = {"name": city, "count": "1", "language": "en", "format": "json"}
        payload = await self._request_json(self._geocoding_url, params)
        return parse_geocoding_response(payload)

    async def get_current_conditions(self, coordinates: Coordinates) -> ProviderConditions:
        params = {
            "latitude": str(coordinates.latitude),
            "longitude": str(coordinates.longitude),
            "current": CURRENT_FIELDS,
            "temperature_unit": "celsius",
            "wind_speed_unit": "kmh",
        }
        payload = await self._request_json(self._forecast_url, params)
        return parse_forecast_response(payload)

    async def _request_json(self, url: str, params: dict[str, str]) -> object:
        owns_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=self._timeout_ms / 1000)
        try:
            response = await client.get(url, params=params)
            if not response.is_success:
                raise RuntimeError(f"External status {response.status_code}")
            return response.json()
        except Exception as error:
            if isinstance(error, AppError):
                raise
            raise weather_unavailable_error(error) from error
        finally:
            if owns_client:
                await client.aclose()


def parse_geocoding_response(payload: object) -> ResolvedLocation | None:
    if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
        raise weather_unavailable_error()
    results = payload["results"]
    if len(results) == 0:
        return None
    result = results[0]
    if not isinstance(result, dict):
        raise weather_unavailable_error()
    return ResolvedLocation(
        city=_read_text(result.get("name")),
        administrativeArea=_read_administrative_area(result),
        country=_read_text(result.get("country")),
        coordinates=Coordinates(
            latitude=_read_coordinate(result.get("latitude"), -90, 90),
            longitude=_read_coordinate(result.get("longitude"), -180, 180),
        ),
    )


def parse_forecast_response(payload: object) -> ProviderConditions:
    if not isinstance(payload, dict):
        raise weather_unavailable_error()
    current = payload.get("current")
    units = payload.get("current_units")
    if not isinstance(current, dict) or not isinstance(units, dict):
        raise weather_unavailable_error()
    _validate_units(units)
    weather_code = _read_integer(current.get("weather_code"))
    if not is_known_weather_code(weather_code):
        raise weather_unavailable_error()
    return ProviderConditions(
        temperature=_read_number(current.get("temperature_2m"), -100, 100),
        apparentTemperature=_read_number(current.get("apparent_temperature"), -100, 100),
        weatherCode=weather_code,
        relativeHumidity=_read_number(current.get("relative_humidity_2m"), 0, 100),
        windSpeed=_read_number(current.get("wind_speed_10m"), 0, 500),
    )


def _read_text(value: object) -> str:
    if not isinstance(value, str) or value.strip() == "":
        raise weather_unavailable_error()
    return value.strip()


def _read_administrative_area(result: dict) -> str | None:
    for key in ("admin1", "admin2", "admin3", "admin4"):
        value = result.get(key)
        if isinstance(value, str) and value.strip() != "":
            return value.strip()
    return None


def _read_coordinate(value: object, minimum: float, maximum: float) -> float:
    return _read_number(value, minimum, maximum)


def _validate_units(units: dict) -> None:
    if units.get("temperature_2m") != EXPECTED_UNITS["temperature"]:
        raise weather_unavailable_error()
    if units.get("apparent_temperature") != EXPECTED_UNITS["temperature"]:
        raise weather_unavailable_error()
    if units.get("relative_humidity_2m") != EXPECTED_UNITS["humidity"]:
        raise weather_unavailable_error()
    if units.get("wind_speed_10m") != EXPECTED_UNITS["wind"]:
        raise weather_unavailable_error()


def _read_number(value: object, minimum: float, maximum: float) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise weather_unavailable_error()
    number = float(value)
    if number != number or number < minimum or number > maximum:
        raise weather_unavailable_error()
    return number


def _read_integer(value: object) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise weather_unavailable_error()
    return value
