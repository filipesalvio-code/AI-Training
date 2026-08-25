from __future__ import annotations

import re

from src.errors.app_error import invalid_city_error


def normalize_city(value: object) -> str:
    if not isinstance(value, str):
        raise invalid_city_error()
    normalized = re.sub(r"\s+", " ", value.strip())
    useful = [character for character in normalized if character.isalnum()]
    if len(useful) < 2:
        raise invalid_city_error()
    return normalized
