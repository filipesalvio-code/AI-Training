from __future__ import annotations

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from src.services.flight_service import FlightServiceError, search_flights

router = APIRouter()


@router.get("/search")
async def search(
    request: Request,
    origin: str | None = Query(default=None),
    destination: str | None = Query(default=None),
    date: str | None = Query(default=None),
):
    if not origin or not destination or not date:
        return JSONResponse(
            status_code=400,
            content={"error": "Provide origin, destination, and date."},
        )
    try:
        return await search_flights(
            request.app.state.db_pool,
            origin=origin,
            destination=destination,
            date=date,
        )
    except FlightServiceError as error:
        return JSONResponse(status_code=400, content={"error": str(error)})
