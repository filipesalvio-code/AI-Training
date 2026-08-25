from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Environment:
    port: int
    cors_origin: str
    geocoding_url: str
    forecast_url: str
    timeout_ms: int


def load_environment(source: dict[str, str] | None = None) -> Environment:
    env = source if source is not None else dict(os.environ)
    return Environment(
        port=_positive_int(env.get("PORT"), 3000),
        cors_origin=env.get("CORS_ORIGIN") or "http://localhost:5173",
        geocoding_url=env.get("OPEN_METEO_GEOCODING_URL") or "https://geocoding-api.open-meteo.com/v1/search",
        forecast_url=env.get("OPEN_METEO_FORECAST_URL") or "https://api.open-meteo.com/v1/forecast",
        timeout_ms=_positive_int(env.get("OPEN_METEO_TIMEOUT_MS"), 2500),
    )


def _positive_int(value: str | None, fallback: int) -> int:
    parsed = int(value) if value is not None else fallback
    if parsed <= 0:
        raise ValueError("numeric configuration must be a positive integer")
    return parsed
