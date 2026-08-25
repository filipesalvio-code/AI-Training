from __future__ import annotations

import httpx

from src.models.weather import CurrentWeather, WeatherLocation

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"


async def find_location(city: str, client: httpx.AsyncClient | None = None) -> WeatherLocation | None:
    params = {"name": city, "count": "1", "language": "en", "format": "json"}
    owns_client = client is None
    if owns_client:
        client = httpx.AsyncClient()
    assert client is not None
    try:
        response = await client.get(GEOCODING_URL, params=params)
        if not response.is_success:
            raise RuntimeError(f"Open-Meteo responded with status {response.status_code}")
        data = response.json()
        results = data.get("results") or []
        if not results:
            return None
        result = results[0]
        return WeatherLocation(
            name=result["name"],
            country=result["country"],
            latitude=result["latitude"],
            longitude=result["longitude"],
        )
    finally:
        if owns_client:
            await client.aclose()


async def fetch_current_weather(
    location: WeatherLocation, client: httpx.AsyncClient | None = None
) -> CurrentWeather:
    params = {
        "latitude": str(location.latitude),
        "longitude": str(location.longitude),
        "current": "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
        "timezone": "auto",
    }
    owns_client = client is None
    if owns_client:
        client = httpx.AsyncClient()
    assert client is not None
    try:
        response = await client.get(WEATHER_URL, params=params)
        if not response.is_success:
            raise RuntimeError(f"Open-Meteo responded with status {response.status_code}")
        current = (response.json() or {}).get("current")
        if not current or any(current.get(key) is None for key in (
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "wind_speed_10m",
            "weather_code",
            "is_day",
            "time",
        )):
            raise RuntimeError("Weather response is incomplete")
        return CurrentWeather(
            temperatureCelsius=current["temperature_2m"],
            apparentTemperatureCelsius=current["apparent_temperature"],
            relativeHumidity=current["relative_humidity_2m"],
            windSpeedKmh=current["wind_speed_10m"],
            weatherCode=current["weather_code"],
            isDay=current["is_day"] == 1,
            observedAt=current["time"],
        )
    finally:
        if owns_client:
            await client.aclose()
