from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.errors.app_error import AppError
from src.services.get_current_weather import GetCurrentWeather


def create_weather_router(service: GetCurrentWeather) -> APIRouter:
    router = APIRouter()

    @router.post("/weather")
    async def weather(request: Request):
        headers = {"Cache-Control": "no-store"}
        try:
            body = await request.json()
            result = await service.execute(body)
            # Ensure countryCode is present as null when absent
            payload = result.model_dump()
            if payload["location"].get("countryCode") is None:
                payload["location"]["countryCode"] = None
            return JSONResponse(content=payload, headers=headers)
        except AppError as error:
            return JSONResponse(
                status_code=error.status_code,
                content={"error": {"code": error.code, "message": str(error)}},
                headers=headers,
            )

    return router
