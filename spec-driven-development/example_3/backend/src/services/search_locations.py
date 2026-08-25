from __future__ import annotations

import asyncio

from src.errors.app_error import AppError
from src.models.weather import (
    LocationSuggestion,
    LocationSuggestionsResponse,
    MAX_LOCATION_SUGGESTIONS,
    ResolvedLocation,
    WeatherProvider,
)
from src.observability.logger import logger
from src.services.normalize_location_query import normalize_location_query


class SearchLocations:
    def __init__(self, provider: WeatherProvider, timeout_ms: int):
        self._provider = provider
        self._timeout_ms = timeout_ms

    async def execute(self, query: str | None) -> LocationSuggestionsResponse:
        normalized_query = normalize_location_query(query)
        started = asyncio.get_event_loop().time()
        try:
            locations = await asyncio.wait_for(
                self._provider.search_locations(normalized_query),
                timeout=self._timeout_ms / 1000,
            )
            suggestions = [_to_suggestion(location) for location in locations[:MAX_LOCATION_SUGGESTIONS]]
            logger.info(
                "location_suggestions_completed",
                {
                    "status": 200,
                    "result": "success" if suggestions else "empty",
                    "resultCount": len(suggestions),
                    "durationMs": int((asyncio.get_event_loop().time() - started) * 1000),
                },
            )
            return LocationSuggestionsResponse(suggestions=suggestions)
        except AppError:
            raise
        except Exception as error:
            raise AppError("LOCATION_SERVICE_UNAVAILABLE", 503, cause=error) from error


def _to_suggestion(location: ResolvedLocation) -> LocationSuggestion:
    payload: dict = {
        "city": location.city,
        "administrativeArea": location.administrativeArea,
        "country": location.country,
        "coordinates": location.coordinates,
    }
    if location.countryCode:
        payload["countryCode"] = location.countryCode
    return LocationSuggestion(**payload)
