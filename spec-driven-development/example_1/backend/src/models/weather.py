from __future__ import annotations

from typing import Protocol

from pydantic import BaseModel


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class ResolvedLocation(BaseModel):
    city: str
    administrativeArea: str | None
    country: str
    coordinates: Coordinates


class ProviderConditions(BaseModel):
    temperature: float
    apparentTemperature: float
    weatherCode: int
    relativeHumidity: float
    windSpeed: float


class WeatherLocation(BaseModel):
    city: str
    administrativeArea: str | None
    country: str


class CurrentConditions(BaseModel):
    temperature: float
    apparentTemperature: float
    condition: str
    relativeHumidity: float
    windSpeed: float


class WeatherUnits(BaseModel):
    temperature: str
    apparentTemperature: str
    relativeHumidity: str
    windSpeed: str


class SourceAttribution(BaseModel):
    name: str
    url: str
    license: str
    licenseUrl: str


class WeatherResponse(BaseModel):
    location: WeatherLocation
    current: CurrentConditions
    units: WeatherUnits
    source: SourceAttribution


class WeatherProvider(Protocol):
    async def search_first_location(self, city: str) -> ResolvedLocation | None: ...

    async def get_current_conditions(self, coordinates: Coordinates) -> ProviderConditions: ...
