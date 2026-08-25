from __future__ import annotations

import time

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.errors.app_error import AppError
from src.observability.logger import logger
from src.services.get_current_weather import GetCurrentWeather


def create_weather_router(service: GetCurrentWeather) -> APIRouter:
    weather_router = APIRouter()

    @weather_router.get("/weather")
    async def weather(request: Request):
        started_at = time.time()
        headers = {"Cache-Control": "no-store"}
        city_values = request.query_params.getlist("city")
        try:
            if len(city_values) > 1:
                raise AppError("INVALID_CITY", 400)
            city = city_values[0] if city_values else None
            result = await service.execute(city)
            logger.info(
                "weather_query_completed",
                {
                    "route": "/weather",
                    "status": 200,
                    "outcome": "success",
                    "durationMs": int((time.time() - started_at) * 1000),
                },
            )
            return JSONResponse(content=result.model_dump(), headers=headers)
        except AppError as error:
            logger.info(
                "weather_query_completed",
                {
                    "route": "/weather",
                    "status": error.status_code,
                    "outcome": error.code,
                    "durationMs": int((time.time() - started_at) * 1000),
                },
            )
            return JSONResponse(
                status_code=error.status_code,
                content={"error": {"code": error.code, "message": str(error)}},
                headers=headers,
            )

    return weather_router
