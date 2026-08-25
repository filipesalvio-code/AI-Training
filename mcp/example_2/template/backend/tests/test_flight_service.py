from __future__ import annotations

import pytest

from src.services.flight_service import (
    FlightServiceError,
    resolve_airport,
    search_flights,
)


def test_resolve_airport_sao_paulo_destination():
    assert resolve_airport("São Paulo", "destination") == "SAO_PAULO"
    assert resolve_airport("FLN", "origin") == "FLN"


def test_resolve_airport_invalid():
    with pytest.raises(FlightServiceError, match="invalid"):
        resolve_airport("XYZ", "origin")


@pytest.mark.asyncio
async def test_search_flights_rejects_same_origin_destination(monkeypatch):
    class DummyPool:
        pass

    with pytest.raises(FlightServiceError, match="different"):
        await search_flights(
            DummyPool(),  # type: ignore[arg-type]
            origin="FLN",
            destination="FLN",
            date="2026-06-10",
        )


@pytest.mark.asyncio
async def test_search_flights_rejects_out_of_range_date():
    class DummyPool:
        pass

    with pytest.raises(FlightServiceError, match="between"):
        await search_flights(
            DummyPool(),  # type: ignore[arg-type]
            origin="FLN",
            destination="CGH",
            date="2026-06-20",
        )
