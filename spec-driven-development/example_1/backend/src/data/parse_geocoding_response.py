from __future__ import annotations

from src.errors.app_error import weather_unavailable_error
from src.models.weather import Coordinates, ResolvedLocation


def parse_geocoding_response(payload: object) -> ResolvedLocation | None:
    if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
        raise weather_unavailable_error()
    results = payload["results"]
    if len(results) == 0:
        return None
    result = results[0]
    if not isinstance(result, dict):
        raise weather_unavailable_error()
    return ResolvedLocation(
        city=_read_text(result.get("name")),
        administrativeArea=_read_administrative_area(result),
        country=_read_text(result.get("country")),
        coordinates=Coordinates(
            latitude=_read_coordinate(result.get("latitude"), -90, 90),
            longitude=_read_coordinate(result.get("longitude"), -180, 180),
        ),
    )


def _read_text(value: object) -> str:
    if not isinstance(value, str) or value.strip() == "":
        raise weather_unavailable_error()
    return value.strip()


def _read_administrative_area(result: dict) -> str | None:
    for key in ("admin1", "admin2", "admin3", "admin4"):
        value = result.get(key)
        if isinstance(value, str) and value.strip() != "":
            return value.strip()
    return None


def _read_coordinate(value: object, minimum: float, maximum: float) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise weather_unavailable_error()
    number = float(value)
    if number != number or number < minimum or number > maximum:
        raise weather_unavailable_error()
    return number
