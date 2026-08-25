from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

DEFAULT_PORT = 3000
DEFAULT_CORS_ORIGIN = "*"
DEFAULT_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
DEFAULT_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
DEFAULT_TIMEOUT_MS = 2500


@dataclass(frozen=True)
class EnvironmentConfig:
    port: int
    cors_origin: str
    open_meteo_geocoding_url: str
    open_meteo_forecast_url: str
    open_meteo_timeout_ms: int


def load_environment(source: dict[str, str] | None = None) -> EnvironmentConfig:
    import os

    env = source if source is not None else dict(os.environ)
    return EnvironmentConfig(
        port=_read_port(env.get("PORT")),
        cors_origin=_read_cors_origin(env.get("CORS_ORIGIN")),
        open_meteo_geocoding_url=_read_url(env.get("OPEN_METEO_GEOCODING_URL"), DEFAULT_GEOCODING_URL),
        open_meteo_forecast_url=_read_url(env.get("OPEN_METEO_FORECAST_URL"), DEFAULT_FORECAST_URL),
        open_meteo_timeout_ms=_read_positive_integer(
            env.get("OPEN_METEO_TIMEOUT_MS"), DEFAULT_TIMEOUT_MS, "OPEN_METEO_TIMEOUT_MS"
        ),
    )


def _read_port(value: str | None) -> int:
    port = _read_positive_integer(value, DEFAULT_PORT, "PORT")
    if port > 65535:
        raise ValueError("PORT must be between 1 and 65535")
    return port


def _read_cors_origin(value: str | None) -> str:
    if value is None or value == DEFAULT_CORS_ORIGIN:
        return DEFAULT_CORS_ORIGIN
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(f"Invalid CORS_ORIGIN: {value}")
    return f"{parsed.scheme}://{parsed.netloc}"


def _read_positive_integer(value: str | None, fallback: int, name: str) -> int:
    if value is None:
        return fallback
    try:
        parsed = int(value)
    except ValueError as error:
        raise ValueError(f"{name} must be a positive integer") from error
    if parsed <= 0:
        raise ValueError(f"{name} must be a positive integer")
    return parsed


def _read_url(value: str | None, fallback: str) -> str:
    url = value or fallback
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(f"Invalid URL: {url}")
    return url.rstrip("/")
