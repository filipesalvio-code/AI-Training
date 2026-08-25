from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.errors.app_error import AppError
from src.services.search_locations import SearchLocations


def create_locations_router(service: SearchLocations) -> APIRouter:
    router = APIRouter()

    @router.get("/locations")
    async def locations(request: Request):
        headers = {"Cache-Control": "no-store"}
        query_values = request.query_params.getlist("query")
        try:
            if len(query_values) > 1:
                raise AppError("INVALID_LOCATION_QUERY", 400)
            query = query_values[0] if query_values else None
            result = await service.execute(query)
            return JSONResponse(content=result.model_dump(exclude_none=True), headers=headers)
        except AppError as error:
            return JSONResponse(
                status_code=error.status_code,
                content={"error": {"code": error.code, "message": str(error)}},
                headers=headers,
            )

    return router
