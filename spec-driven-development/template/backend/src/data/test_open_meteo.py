from __future__ import annotations

import pytest

from src.data.open_meteo import parse_forecast_response, parse_geocoding_response
from src.errors import AppError


def test_parse_geocoding_returns_first_result():
    payload = {
        "results": [
            {
                "name": "São Paulo",
                "admin1": "São Paulo",
                "country": "Brazil",
                "latitude": -23.5,
                "longitude": -46.6,
            }
        ]
    }
    location = parse_geocoding_response(payload)
    assert location is not None
    assert location.city == "São Paulo"
    assert location.administrativeArea == "São Paulo"
    assert location.country == "Brazil"


def test_parse_geocoding_empty_results_returns_none():
    assert parse_geocoding_response({"results": []}) is None


def test_parse_forecast_validates_units_and_ranges():
    payload = {
        "current": {
            "temperature_2m": 24.3,
            "apparent_temperature": 25.1,
            "weather_code": 2,
            "relative_humidity_2m": 72,
            "wind_speed_10m": 12.4,
        },
        "current_units": {
            "temperature_2m": "°C",
            "apparent_temperature": "°C",
            "relative_humidity_2m": "%",
            "wind_speed_10m": "km/h",
        },
    }
    conditions = parse_forecast_response(payload)
    assert conditions.temperature == 24.3
    assert conditions.weatherCode == 2


def test_parse_forecast_rejects_invalid_payload():
    with pytest.raises(AppError) as error:
        parse_forecast_response({"current": {}})
    assert error.value.code == "WEATHER_SERVICE_UNAVAILABLE"
