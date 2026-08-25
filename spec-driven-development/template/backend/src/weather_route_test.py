from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from src.app import AppOptions, create_app
from src.models.weather import Coordinates, ProviderConditions, ResolvedLocation


LOCATION = ResolvedLocation(
    city="São Paulo",
    administrativeArea="São Paulo",
    country="Brazil",
    coordinates=Coordinates(latitude=-23.5, longitude=-46.6),
)
CONDITIONS = ProviderConditions(
    temperature=24.3,
    apparentTemperature=25.1,
    weatherCode=2,
    relativeHumidity=72,
    windSpeed=12.4,
)


class FakeProvider:
    def __init__(self, **overrides: Any):
        self.search_calls = 0
        self.conditions_calls = 0
        self._search = overrides.get("search", lambda city: LOCATION)
        self._conditions = overrides.get("conditions", lambda coords: CONDITIONS)
        self._search_error = overrides.get("search_error")
        self._conditions_error = overrides.get("conditions_error")
        self._null_location = overrides.get("null_location", False)

    async def search_first_location(self, city: str) -> ResolvedLocation | None:
        self.search_calls += 1
        if self._search_error:
            raise self._search_error
        if self._null_location:
            return None
        return self._search(city)

    async def get_current_conditions(self, coordinates: Coordinates) -> ProviderConditions:
        self.conditions_calls += 1
        if self._conditions_error:
            raise self._conditions_error
        return self._conditions(coordinates)


@pytest.fixture
def client_factory():
    def _make(provider: FakeProvider | None = None) -> tuple[TestClient, FakeProvider]:
        fake = provider or FakeProvider()
        client = TestClient(create_app(AppOptions(weather_provider=fake)))
        return client, fake

    return _make


def test_returns_200_contract_with_units_source_and_no_store(client_factory):
    client, _ = client_factory()
    response = client.get("/weather", params={"city": "São Paulo"})
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.json()["location"] == {
        "city": LOCATION.city,
        "administrativeArea": LOCATION.administrativeArea,
        "country": LOCATION.country,
    }
    assert response.json()["current"]["condition"] == "Partly cloudy"
    assert response.json()["source"]["name"] == "Open-Meteo"


def test_rejects_invalid_query_without_provider(client_factory):
    client, provider = client_factory()
    response = client.get("/weather", params={"city": "a"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_CITY"
    assert provider.search_calls == 0

    response = client.get("/weather?city=São%20Paulo&city=Lisboa")
    assert response.status_code == 400
    assert provider.search_calls == 0


def test_empty_geocoding_becomes_404(client_factory):
    client, provider = client_factory(FakeProvider(null_location=True))
    response = client.get("/weather", params={"city": "Cidade"})
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CITY_NOT_FOUND"
    assert provider.conditions_calls == 0


def test_provider_failures_become_503(client_factory):
    client, _ = client_factory(FakeProvider(search_error=RuntimeError("network")))
    response = client.get("/weather", params={"city": "Lisboa"})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "WEATHER_SERVICE_UNAVAILABLE"

    client, _ = client_factory(FakeProvider(conditions_error=RuntimeError("timeout")))
    response = client.get("/weather", params={"city": "Lisboa"})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "WEATHER_SERVICE_UNAVAILABLE"


def test_health_check(client_factory):
    client, _ = client_factory()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
