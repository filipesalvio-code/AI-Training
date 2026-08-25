from __future__ import annotations

from typing import Literal

AppErrorCode = Literal[
    "INVALID_LOCATION_QUERY",
    "LOCATION_SERVICE_UNAVAILABLE",
    "INVALID_LOCATION",
    "WEATHER_SERVICE_UNAVAILABLE",
    "INTERNAL_ERROR",
]

ERROR_MESSAGES: dict[AppErrorCode, str] = {
    "INVALID_LOCATION_QUERY": "Enter at least two characters to search for a location.",
    "LOCATION_SERVICE_UNAVAILABLE": "We could not search locations right now. Try again.",
    "INVALID_LOCATION": "Select a valid location.",
    "WEATHER_SERVICE_UNAVAILABLE": "We could not check the weather right now. Try again shortly.",
    "INTERNAL_ERROR": "An unexpected error occurred. Try again.",
}


class AppError(Exception):
    def __init__(self, code: AppErrorCode, status: int, cause: object | None = None):
        super().__init__(ERROR_MESSAGES[code])
        self.code = code
        self.status = status
        self.status_code = status
        self.cause = cause
