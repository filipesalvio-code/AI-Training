from __future__ import annotations

import httpx
import pytest
import respx

from src.data.open_meteo import GEOCODING_URL, WEATHER_URL
from src.services.weather import get_weather

geocoding_response = {
    "results": [{"name": "São Paulo", "country": "Brazil", "latitude": -23.5, "longitude": -46.6}]
}
forecast_response = {
    "current": {
        "temperature_2m": 24,
        "apparent_temperature": 25,
        "relative_humidity_2m": 70,
        "wind_speed_10m": 12,
        "weather_code": 1,
        "is_day": 1,
        "time": "2026-07-31T12:00",
    }
}


@respx.mock
async def test_combines_location_and_current_weather() -> None:
    respx.get(GEOCODING_URL).mock(return_value=httpx.Response(200, json=geocoding_response))
    respx.get(WEATHER_URL).mock(return_value=httpx.Response(200, json=forecast_response))
    weather = await get_weather(" São Paulo ")
    assert weather.location.name == "São Paulo"
    assert weather.current.temperatureCelsius == 24


async def test_rejects_short_city_before_api() -> None:
    with pytest.raises(ValueError, match="Enter a valid city"):
        await get_weather("A")


@respx.mock
async def test_reports_when_city_not_found() -> None:
    respx.get(GEOCODING_URL).mock(return_value=httpx.Response(200, json={"results": []}))
    with pytest.raises(LookupError, match="We could not find"):
        await get_weather("Unknown City")
