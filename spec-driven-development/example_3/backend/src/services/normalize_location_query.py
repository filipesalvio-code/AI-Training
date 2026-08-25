from __future__ import annotations

import re

from src.errors.app_error import AppError


def normalize_location_query(query: object) -> str:
    if query is not None and not isinstance(query, str):
        raise AppError("INVALID_LOCATION_QUERY", 400)
    normalized = re.sub(r"\s+", " ", (query or "").strip())
    useful = [character for character in normalized if character.isalnum()]
    if len(useful) < 2:
        raise AppError("INVALID_LOCATION_QUERY", 400)
    return normalized
