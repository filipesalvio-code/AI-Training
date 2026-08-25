from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.routes.weather import router as weather_router


def create_app() -> FastAPI:
    app = FastAPI(redirect_slashes=False)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

    app.include_router(weather_router, prefix="/weather")

    @app.exception_handler(Exception)
    async def unhandled_error(_request: Request, error: Exception):
        return JSONResponse(
            status_code=500,
            content={"error": "Something went wrong!", "message": str(error)},
        )

    return app
