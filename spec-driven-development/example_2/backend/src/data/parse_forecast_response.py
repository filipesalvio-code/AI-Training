from __future__ import annotations

from src.errors.app_error import weather_unavailable_error
from src.models.weather import ProviderConditions
from src.services.weather_condition import is_known_weather_code

EXPECTED_UNITS = {"temperature": "°C", "humidity": "%", "wind": "km/h"}


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
