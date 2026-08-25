from __future__ import annotations

from typing import Literal

AppErrorCode = Literal[
    "INVALID_CITY",
    "CITY_NOT_FOUND",
    "WEATHER_SERVICE_UNAVAILABLE",
    "INTERNAL_ERROR",
]

ERROR_MESSAGES: dict[AppErrorCode, str] = {
    "INVALID_CITY": "Enter a city with at least two characters.",
    "CITY_NOT_FOUND": "City not found. Check the name and try again.",
    "WEATHER_SERVICE_UNAVAILABLE": "We could not check the weather right now. Try again shortly.",
    "INTERNAL_ERROR": "An unexpected error occurred. Try again shortly.",
}


class AppError(Exception):
    def __init__(
        self,
        code: AppErrorCode,
        status_code: int,
        message: str | None = None,
        cause: object | None = None,
    ):
        super().__init__(message or ERROR_MESSAGES[code])
        self.code = code
        self.status_code = status_code
        self.cause = cause


def invalid_city_error() -> AppError:
    return AppError("INVALID_CITY", 400)


def city_not_found_error() -> AppError:
    return AppError("CITY_NOT_FOUND", 404)


def weather_unavailable_error(cause: object | None = None) -> AppError:
    return AppError("WEATHER_SERVICE_UNAVAILABLE", 503, cause=cause)
