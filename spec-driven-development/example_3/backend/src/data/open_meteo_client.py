from __future__ import annotations

import httpx

from src.config.environment import Environment
from src.data.parse_forecast_response import parse_forecast_response
from src.data.parse_geocoding_response import parse_geocoding_response
from src.errors.app_error import AppError
from src.models.weather import Coordinates, MAX_LOCATION_SUGGESTIONS, ProviderConditions, ResolvedLocation

CURRENT_FIELDS = "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m"


class OpenMeteoClient:
    def __init__(self, environment: Environment, client: httpx.AsyncClient | None = None):
        self._environment = environment
        self._client = client

    async def search_locations(self, query: str) -> list[ResolvedLocation]:
        params = {
            "name": query,
            "count": str(MAX_LOCATION_SUGGESTIONS),
            "language": "en",
            "format": "json",
        }
        payload = await self._fetch_json(
            self._environment.geocoding_url, params, "LOCATION_SERVICE_UNAVAILABLE"
        )
        return parse_geocoding_response(payload)

    async def get_current_conditions(self, coordinates: Coordinates) -> ProviderConditions:
        params = {
            "latitude": str(coordinates.latitude),
            "longitude": str(coordinates.longitude),
            "current": CURRENT_FIELDS,
            "temperature_unit": "celsius",
            "wind_speed_unit": "kmh",
        }
        payload = await self._fetch_json(
            self._environment.forecast_url, params, "WEATHER_SERVICE_UNAVAILABLE"
        )
        return parse_forecast_response(payload)

    async def _fetch_json(self, url: str, params: dict[str, str], error_code: str) -> object:
        owns = self._client is None
        client = self._client or httpx.AsyncClient(timeout=self._environment.timeout_ms / 1000)
        try:
            response = await client.get(url, params=params)
            if not response.is_success:
                raise RuntimeError(f"HTTP {response.status_code}")
            return response.json()
        except AppError:
            raise
        except Exception as error:
            raise AppError(error_code, 503, error) from error  # type: ignore[arg-type]
        finally:
            if owns:
                await client.aclose()
