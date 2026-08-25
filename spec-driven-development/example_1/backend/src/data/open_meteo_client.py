from __future__ import annotations

import httpx

from src.data.parse_forecast_response import parse_forecast_response
from src.data.parse_geocoding_response import parse_geocoding_response
from src.errors.app_error import AppError, weather_unavailable_error
from src.models.weather import Coordinates, ProviderConditions, ResolvedLocation
from src.observability.logger import logger

DEFAULT_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
DEFAULT_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CURRENT_FIELDS = "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m"


class OpenMeteoClient:
    def __init__(
        self,
        geocoding_url: str = DEFAULT_GEOCODING_URL,
        forecast_url: str = DEFAULT_FORECAST_URL,
        client: httpx.AsyncClient | None = None,
        timeout_ms: int = 2500,
    ):
        self._geocoding_url = geocoding_url
        self._forecast_url = forecast_url
        self._client = client
        self._timeout_ms = timeout_ms

    async def search_first_location(self, city: str) -> ResolvedLocation | None:
        params = {"name": city, "count": "1", "language": "en", "format": "json"}
        payload = await self._request_json(self._geocoding_url, params, "geocoding")
        try:
            return parse_geocoding_response(payload)
        except Exception as error:
            if isinstance(error, AppError):
                raise
            logger.error("weather_provider_failed", error, {"dependency": "geocoding"})
            raise weather_unavailable_error(error) from error

    async def get_current_conditions(self, coordinates: Coordinates) -> ProviderConditions:
        params = {
            "latitude": str(coordinates.latitude),
            "longitude": str(coordinates.longitude),
            "current": CURRENT_FIELDS,
            "temperature_unit": "celsius",
            "wind_speed_unit": "kmh",
        }
        payload = await self._request_json(self._forecast_url, params, "forecast")
        try:
            return parse_forecast_response(payload)
        except Exception as error:
            if isinstance(error, AppError):
                raise
            logger.error("weather_provider_failed", error, {"dependency": "forecast"})
            raise weather_unavailable_error(error) from error

    async def _request_json(self, url: str, params: dict[str, str], dependency: str) -> object:
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
            logger.error("weather_provider_failed", error, {"dependency": dependency})
            raise weather_unavailable_error(error) from error
        finally:
            if owns_client:
                await client.aclose()
