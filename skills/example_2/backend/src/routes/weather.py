from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from src.services.weather import get_weather

router = APIRouter()


@router.get("")
async def weather(city: str = Query(default="")):
    try:
        return await get_weather(city)
    except ValueError as error:
        return JSONResponse(status_code=400, content={"error": str(error)})
    except LookupError as error:
        return JSONResponse(status_code=404, content={"error": str(error)})
    except Exception as error:
        message = str(error) if str(error) else "Could not fetch weather"
        return JSONResponse(status_code=500, content={"error": message})
