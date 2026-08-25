from __future__ import annotations

import httpx
import pytest
import respx
from fastapi.testclient import TestClient

from src.app import create_app
from src.data.open_meteo import GEOCODING_URL, WEATHER_URL


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_health_check_available(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_validation_error_when_city_missing(client: TestClient) -> None:
    response = client.get("/weather")
    assert response.status_code == 400
    assert response.json()["error"] == "Enter a valid city"


@respx.mock
def test_returns_weather_for_valid_city(client: TestClient) -> None:
    respx.get(GEOCODING_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "results": [
                    {"name": "Recife", "country": "Brazil", "latitude": -8, "longitude": -34}
                ]
            },
        )
    )
    respx.get(WEATHER_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "current": {
                    "temperature_2m": 28,
                    "apparent_temperature": 30,
                    "relative_humidity_2m": 80,
                    "wind_speed_10m": 10,
                    "weather_code": 0,
                    "is_day": 1,
                    "time": "2026-07-31T12:00",
                }
            },
        )
    )
    response = client.get("/weather?city=Recife")
    assert response.status_code == 200
    assert response.json()["current"]["temperatureCelsius"] == 28
    assert response.json()["current"]["weatherCode"] == 0
