from __future__ import annotations

import asyncio

from src.errors.app_error import AppError, city_not_found_error, weather_unavailable_error
from src.models.weather import (
    CurrentConditions,
    ProviderConditions,
    ResolvedLocation,
    SourceAttribution,
    WeatherLocation,
    WeatherProvider,
    WeatherResponse,
    WeatherUnits,
)
from src.services.normalize_city import normalize_city
from src.services.weather_condition import get_weather_condition

DEFAULT_TIMEOUT_MS = 2500
SOURCE = SourceAttribution(
    name="Open-Meteo",
    url="https://open-meteo.com/",
    license="CC BY 4.0",
    licenseUrl="https://creativecommons.org/licenses/by/4.0/",
)


class GetCurrentWeather:
    def __init__(self, provider: WeatherProvider, timeout_ms: int = DEFAULT_TIMEOUT_MS):
        self._provider = provider
        self._timeout_ms = timeout_ms

    async def execute(self, city: object) -> WeatherResponse:
        normalized_city = normalize_city(city)
        try:
            location = await asyncio.wait_for(
                self._provider.search_first_location(normalized_city),
                timeout=self._timeout_ms / 1000,
            )
            if location is None:
                raise city_not_found_error()
            conditions = await asyncio.wait_for(
                self._provider.get_current_conditions(location.coordinates),
                timeout=self._timeout_ms / 1000,
            )
            return _create_weather_response(location, conditions)
        except AppError:
            raise
        except Exception as error:
            raise weather_unavailable_error(error) from error


def _create_weather_response(
    location: ResolvedLocation, conditions: ProviderConditions
) -> WeatherResponse:
    return WeatherResponse(
        location=WeatherLocation(
            city=location.city,
            administrativeArea=location.administrativeArea,
            country=location.country,
        ),
        current=CurrentConditions(
            temperature=conditions.temperature,
            apparentTemperature=conditions.apparentTemperature,
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
