from __future__ import annotations

import re

from src.errors.app_error import AppError
from src.models.weather import Coordinates, LocationSuggestion


def validate_selected_location(value: object) -> LocationSuggestion:
    if not isinstance(value, dict):
        raise AppError("INVALID_LOCATION", 400)
    city = _required_text(value.get("city"))
    country = _required_text(value.get("country"))
    administrative_area = _administrative_area(value.get("administrativeArea"))
    country_code = _country_code(value.get("countryCode"))
    coordinates = _coordinates(value.get("coordinates"))
    if (
        not city
        or not country
        or administrative_area is False
        or country_code is False
        or coordinates is None
    ):
        raise AppError("INVALID_LOCATION", 400)
    payload: dict = {
        "city": city,
        "administrativeArea": administrative_area,
        "country": country,
        "coordinates": coordinates,
    }
    if country_code:
        payload["countryCode"] = country_code
    return LocationSuggestion(**payload)


def _required_text(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _administrative_area(value: object):
    if value is None:
        return None
    text = _required_text(value)
    return text if text is not None else False


def _country_code(value: object):
    if value is None:
        return None
    if not isinstance(value, str) or not re.fullmatch(r"[a-zA-Z]{2}", value.strip()):
        return False
    return value.strip().upper()


def _coordinates(value: object) -> Coordinates | None:
    if not isinstance(value, dict):
        return None
    latitude = value.get("latitude")
    longitude = value.get("longitude")
    if not isinstance(latitude, (int, float)) or isinstance(latitude, bool) or not (-90 <= float(latitude) <= 90):
        return None
    if not isinstance(longitude, (int, float)) or isinstance(longitude, bool) or not (-180 <= float(longitude) <= 180):
        return None
    return Coordinates(latitude=float(latitude), longitude=float(longitude))
