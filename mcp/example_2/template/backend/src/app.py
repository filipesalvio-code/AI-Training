from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

import asyncpg
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.config.database import database_dsn
from src.data.flight_data import check_database
from src.mcp.server import create_flight_mcp, set_pool
from src.routes.flight_routes import router as flight_router
from src.services.flight_service import FlightServiceError

mcp = create_flight_mcp()
mcp_asgi = mcp.streamable_http_app()


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = await asyncpg.create_pool(dsn=database_dsn(), min_size=1, max_size=10)
    app.state.db_pool = pool
    set_pool(pool)
    async with mcp.session_manager.run():
        try:
            yield
        finally:
            await pool.close()


def create_app() -> FastAPI:
    app = FastAPI(title="AeroBusca", lifespan=lifespan, redirect_slashes=False)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Mcp-Session-Id"],
    )

    @app.get("/health")
    async def health(request: Request):
        try:
            await check_database(request.app.state.db_pool)
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as error:  # noqa: BLE001
            return JSONResponse(
                status_code=500,
                content={"error": str(error) or "Internal server error."},
            )

    app.include_router(flight_router, prefix="/api/flights")
    app.mount("/mcp", mcp_asgi)

    @app.exception_handler(FlightServiceError)
    async def flight_service_error(_request: Request, error: FlightServiceError):
        return JSONResponse(status_code=400, content={"error": str(error)})

    @app.exception_handler(StarletteHTTPException)
    async def http_exception(_request: Request, exc: StarletteHTTPException):
        if exc.status_code == 404:
            return JSONResponse(status_code=404, content={"error": "Route not found."})
        detail = exc.detail
        if isinstance(detail, dict) and "error" in detail:
            return JSONResponse(status_code=exc.status_code, content=detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": detail if isinstance(detail, str) else "Request error."},
        )

    @app.exception_handler(Exception)
    async def unhandled(_request: Request, error: Exception):
        message = str(error) or "Internal server error."
        status = (
            400
            if any(
                token in message.lower()
                for token in ("invalid", "must", "date", "different", "provide")
            )
            else 500
        )
        return JSONResponse(status_code=status, content={"error": message})

    return app


app = create_app()
