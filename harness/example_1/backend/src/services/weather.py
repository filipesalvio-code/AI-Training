from __future__ import annotations

from src.data.open_meteo import fetch_current_weather, find_location
from src.models.weather import Weather

MINIMUM_CITY_LENGTH = 2


async def get_weather(city: str) -> Weather:
    normalized_city = city.strip()
    if len(normalized_city) < MINIMUM_CITY_LENGTH:
        raise ValueError("Enter a valid city")
    location = await find_location(normalized_city)
    if location is None:
        raise LookupError(f'We could not find the city "{normalized_city}"')
    return Weather(location=location, current=await fetch_current_weather(location))
