from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

from src.app import create_app
from src.config.environment import Environment
from src.models.weather import Coordinates, ProviderConditions, ResolvedLocation

environment = Environment(
    port=3000,
    cors_origin="*",
    geocoding_url="https://geo.test",
    forecast_url="https://forecast.test",
    timeout_ms=2500,
)
location = ResolvedLocation(
    city="São Paulo",
    administrativeArea="São Paulo",
    country="Brasil",
    coordinates=Coordinates(latitude=-23.5, longitude=-46.6),
)
conditions = ProviderConditions(
    temperature=24,
    apparentTemperature=25,
    weatherCode=2,
    relativeHumidity=70,
    windSpeed=10,
)


class FakeProvider:
    def __init__(self, **overrides: Any):
        self.search_locations = overrides.get("search_locations", self._search)
        self.get_current_conditions = overrides.get("get_current_conditions", self._conditions)
        self.search_called_with = None
        self.conditions_called_with = None

    async def _search(self, query: str):
        self.search_called_with = query
        return [location]

    async def _conditions(self, coordinates: Coordinates):
        self.conditions_called_with = coordinates
        return conditions


def test_locations_returns_suggestions_with_no_store():
    suggestions = [
        ResolvedLocation(
            city=f"City {i}",
            administrativeArea="SP",
            country="Brasil",
            coordinates=Coordinates(latitude=-23.5, longitude=-46.6),
        )
        for i in range(5)
    ]

    async def search(query: str):
        return suggestions

    provider = FakeProvider(search_locations=search)
    response = TestClient(create_app(environment, provider)).get("/locations?query=spri")
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert len(response.json()["suggestions"]) == 5


def test_locations_rejects_short_query():
    provider = FakeProvider()
    response = TestClient(create_app(environment, provider)).get("/locations?query=a")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_LOCATION_QUERY"
    assert provider.search_called_with is None


def test_locations_empty_success():
    async def search(query: str):
        return []

    response = TestClient(create_app(environment, FakeProvider(search_locations=search))).get(
        "/locations?query=zzzzzz"
    )
    assert response.status_code == 200
    assert response.json() == {"suggestions": []}


def test_locations_provider_failure_503():
    async def search(query: str):
        raise RuntimeError("upstream")

    response = TestClient(create_app(environment, FakeProvider(search_locations=search))).get(
        "/locations?query=Lisboa"
    )
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "LOCATION_SERVICE_UNAVAILABLE"


def test_post_weather_uses_selected_location():
    provider = FakeProvider()
    body = {"location": location.model_dump()}
    response = TestClient(create_app(environment, provider)).post("/weather", json=body)
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.json()["location"] == {
        "city": "São Paulo",
        "administrativeArea": "São Paulo",
        "country": "Brasil",
        "countryCode": None,
    }
    assert provider.search_called_with is None
    assert provider.conditions_called_with == location.coordinates


def test_post_weather_rejects_invalid_location():
    provider = FakeProvider()
    bad = location.model_dump()
    bad["coordinates"] = {"latitude": 200, "longitude": -46.6}
    response = TestClient(create_app(environment, provider)).post("/weather", json={"location": bad})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_LOCATION"
    assert provider.conditions_called_with is None
