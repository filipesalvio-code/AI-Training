from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config.environment import Environment, load_environment
from src.data.open_meteo_client import OpenMeteoClient
from src.errors.app_error import ERROR_MESSAGES, AppError
from src.models.weather import WeatherProvider
from src.observability.logger import logger
from src.routes.health import router as health_router
from src.routes.locations import create_locations_router
from src.routes.weather import create_weather_router
from src.services.get_current_weather import GetCurrentWeather
from src.services.search_locations import SearchLocations


def create_app(
    environment: Environment | None = None,
    provider: WeatherProvider | None = None,
) -> FastAPI:
    environment = environment or load_environment()
    app = FastAPI(redirect_slashes=False)
    weather_provider = provider or OpenMeteoClient(environment)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[environment.cors_origin] if environment.cors_origin != "*" else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(
        create_locations_router(SearchLocations(weather_provider, environment.timeout_ms))
    )
    app.include_router(
        create_weather_router(GetCurrentWeather(weather_provider, environment.timeout_ms))
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, error: AppError):
        return JSONResponse(
            status_code=error.status,
            content={"error": {"code": error.code, "message": str(error)}},
        )

    @app.exception_handler(Exception)
    async def unhandled(_request: Request, error: Exception):
        logger.error("unexpected_error", {"cause": str(error)})
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": ERROR_MESSAGES["INTERNAL_ERROR"],
                }
            },
        )

    return app
