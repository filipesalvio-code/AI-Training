from __future__ import annotations

import asyncio

from src.errors.app_error import AppError
from src.models.weather import (
    CurrentConditions,
    LocationSuggestion,
    ProviderConditions,
    SourceAttribution,
    WeatherLocation,
    WeatherProvider,
    WeatherResponse,
    WeatherUnits,
)
from src.observability.logger import logger
from src.services.validate_selected_location import validate_selected_location
from src.services.weather_condition import get_weather_condition

SOURCE = SourceAttribution(
    name="Open-Meteo",
    url="https://open-meteo.com/",
    license="CC BY 4.0",
    licenseUrl="https://creativecommons.org/licenses/by/4.0/",
)


class GetCurrentWeather:
    def __init__(self, provider: WeatherProvider, timeout_ms: int):
        self._provider = provider
        self._timeout_ms = timeout_ms

    async def execute(self, value: object) -> WeatherResponse:
        location = validate_selected_location(_get_location(value))
        started = asyncio.get_event_loop().time()
        try:
            conditions = await asyncio.wait_for(
                self._provider.get_current_conditions(location.coordinates),
                timeout=self._timeout_ms / 1000,
            )
            response = _build_response(location, conditions)
            logger.info(
                "weather_query_completed",
                {
                    "result": "success",
                    "status": 200,
                    "durationMs": int((asyncio.get_event_loop().time() - started) * 1000),
                },
            )
            return response
        except AppError:
            raise
        except Exception as error:
            raise AppError("WEATHER_SERVICE_UNAVAILABLE", 503, cause=error) from error


def _get_location(value: object) -> object:
    if not isinstance(value, dict) or "location" not in value:
        raise AppError("INVALID_LOCATION", 400)
    return value["location"]


def _build_response(location: LocationSuggestion, conditions: ProviderConditions) -> WeatherResponse:
    return WeatherResponse(
        location=WeatherLocation(
            city=location.city,
            administrativeArea=location.administrativeArea,
            country=location.country,
            countryCode=location.countryCode if location.countryCode is not None else None,
        ),
        current=CurrentConditions(
            temperature=conditions.temperature,
            apparentTemperature=conditions.apparentTemperature,
            weatherCode=conditions.weatherCode,
            condition=get_weather_condition(conditions.weatherCode),
            relativeHumidity=conditions.relativeHumidity,
            windSpeed=conditions.windSpeed,
        ),
        units=WeatherUnits(
            temperature="°C",
            apparentTemperature="°C",
            relativeHumidity="%",
            windSpeed="km/h",
        ),
        source=SOURCE,
    )
