from __future__ import annotations

from src.errors.app_error import AppError
from src.models.weather import ProviderConditions
from src.services.weather_condition import is_known_weather_code

EXPECTED_UNITS = {"temperature": "°C", "humidity": "%", "wind": "km/h"}


def parse_forecast_response(value: object) -> ProviderConditions:
    if not isinstance(value, dict) or not isinstance(value.get("current"), dict) or not isinstance(
        value.get("current_units"), dict
    ):
        raise AppError("WEATHER_SERVICE_UNAVAILABLE", 503)
    current = value["current"]
    units = value["current_units"]
    temperature = _number(current, "temperature_2m")
    apparent_temperature = _number(current, "apparent_temperature")
    weather_code = _number(current, "weather_code")
    relative_humidity = _number(current, "relative_humidity_2m")
    wind_speed = _number(current, "wind_speed_10m")
    if (
        not _has_expected_units(units)
        or temperature is None
        or apparent_temperature is None
        or weather_code is None
        or relative_humidity is None
        or wind_speed is None
        or not float(weather_code).is_integer()
        or not is_known_weather_code(int(weather_code))
        or relative_humidity < 0
        or relative_humidity > 100
        or wind_speed < 0
    ):
        raise AppError("WEATHER_SERVICE_UNAVAILABLE", 503)
    return ProviderConditions(
        temperature=temperature,
        apparentTemperature=apparent_temperature,
        weatherCode=int(weather_code),
        relativeHumidity=relative_humidity,
        windSpeed=wind_speed,
    )


def _number(record: dict, key: str) -> float | None:
    value = record.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = float(value)
    return number if number == number else None


def _has_expected_units(units: dict) -> bool:
    return (
        units.get("temperature_2m") == EXPECTED_UNITS["temperature"]
        and units.get("apparent_temperature") == EXPECTED_UNITS["temperature"]
        and units.get("relative_humidity_2m") == EXPECTED_UNITS["humidity"]
        and units.get("wind_speed_10m") == EXPECTED_UNITS["wind"]
    )
