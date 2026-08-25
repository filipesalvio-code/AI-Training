from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.errors import AppError
from src.services.weather import GetCurrentWeather


def create_weather_router(service: GetCurrentWeather) -> APIRouter:
    weather_router = APIRouter()
    headers = {"Cache-Control": "no-store"}

    @weather_router.get("/weather")
    async def weather(request: Request):
        city_values = request.query_params.getlist("city")
        try:
            if len(city_values) > 1:
                raise AppError("INVALID_CITY", 400)
            city = city_values[0] if city_values else None
            result = await service.execute(city)
            return JSONResponse(content=result.model_dump(), headers=headers)
        except AppError as error:
            return JSONResponse(
                status_code=error.status_code,
                content={"error": {"code": error.code, "message": str(error)}},
                headers=headers,
            )

    return weather_router
