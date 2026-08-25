from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.data.open_meteo_client import OpenMeteoClient
from src.errors.app_error import ERROR_MESSAGES, AppError
from src.models.weather import WeatherProvider
from src.observability.logger import logger
from src.routes.health import router as health_router
from src.routes.weather import create_weather_router
from src.services.get_current_weather import GetCurrentWeather


class AppOptions:
    def __init__(
        self,
        cors_origin: str = "*",
        weather_provider: WeatherProvider | None = None,
        weather_timeout_ms: int = 2500,
        geocoding_url: str | None = None,
        forecast_url: str | None = None,
    ):
        self.cors_origin = cors_origin
        self.weather_provider = weather_provider
        self.weather_timeout_ms = weather_timeout_ms
        self.geocoding_url = geocoding_url
        self.forecast_url = forecast_url


def create_app(options: AppOptions | None = None) -> FastAPI:
    options = options or AppOptions()
    app = FastAPI(redirect_slashes=False)
    provider = options.weather_provider
    if provider is None:
        kwargs: dict = {"timeout_ms": options.weather_timeout_ms}
        if options.geocoding_url:
            kwargs["geocoding_url"] = options.geocoding_url
        if options.forecast_url:
            kwargs["forecast_url"] = options.forecast_url
        provider = OpenMeteoClient(**kwargs)
    weather_service = GetCurrentWeather(provider, options.weather_timeout_ms)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[options.cors_origin] if options.cors_origin != "*" else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(create_weather_router(weather_service))

    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, error: AppError):
        return JSONResponse(
            status_code=error.status_code,
            content={"error": {"code": error.code, "message": str(error)}},
        )

    @app.exception_handler(Exception)
    async def unhandled_error(request: Request, error: Exception):
        logger.error("unexpected_error", error, {"route": request.url.path, "status": 500})
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "INTERNAL_ERROR", "message": ERROR_MESSAGES["INTERNAL_ERROR"]}},
        )

    return app
