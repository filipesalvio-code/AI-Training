from __future__ import annotations

from src.errors.app_error import AppError
from src.models.weather import MAX_LOCATION_SUGGESTIONS, Coordinates, ResolvedLocation


def parse_geocoding_response(value: object) -> list[ResolvedLocation]:
    if not isinstance(value, dict) or not isinstance(value.get("results"), list):
        raise AppError("LOCATION_SERVICE_UNAVAILABLE", 503)
    return [_parse_location(item) for item in value["results"][:MAX_LOCATION_SUGGESTIONS]]


def _parse_location(value: object) -> ResolvedLocation:
    if not isinstance(value, dict):
        raise AppError("LOCATION_SERVICE_UNAVAILABLE", 503)
    city = _text(value, "name")
    country = _text(value, "country")
    coordinates = _coordinates(value.get("latitude"), value.get("longitude"))
    if city is None or country is None or coordinates is None:
        raise AppError("LOCATION_SERVICE_UNAVAILABLE", 503)
    return ResolvedLocation(
        city=city,
        country=country,
        countryCode=_country_code(value),
        administrativeArea=_administrative_area(value),
        coordinates=coordinates,
    )


def _text(record: dict, key: str) -> str | None:
    value = record.get(key)
    return value.strip() if isinstance(value, str) and value.strip() else None


def _administrative_area(record: dict) -> str | None:
    for key in ("admin1", "admin2", "admin3", "admin4"):
        value = _text(record, key)
        if value:
            return value
    return None


def _coordinates(latitude: object, longitude: object) -> Coordinates | None:
    if not isinstance(latitude, (int, float)) or isinstance(latitude, bool):
        return None
    if not isinstance(longitude, (int, float)) or isinstance(longitude, bool):
        return None
    if not (-90 <= float(latitude) <= 90) or not (-180 <= float(longitude) <= 180):
        return None
    return Coordinates(latitude=float(latitude), longitude=float(longitude))


def _country_code(record: dict) -> str | None:
    import re

    country_code = _text(record, "country_code")
    if country_code and re.fullmatch(r"[a-zA-Z]{2}", country_code):
        return country_code.upper()
    return None
