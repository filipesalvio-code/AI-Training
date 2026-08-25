from __future__ import annotations

from typing import Protocol

from pydantic import BaseModel

MAX_LOCATION_SUGGESTIONS = 5


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class ResolvedLocation(BaseModel):
    city: str
    administrativeArea: str | None
    country: str
    countryCode: str | None = None
    coordinates: Coordinates


class LocationSuggestion(BaseModel):
    city: str
    administrativeArea: str | None
    country: str
    countryCode: str | None = None
    coordinates: Coordinates


class LocationSuggestionsResponse(BaseModel):
    suggestions: list[LocationSuggestion]


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
    countryCode: str | None = None


class CurrentConditions(BaseModel):
    temperature: float
    apparentTemperature: float
    weatherCode: int
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
    async def search_locations(self, query: str) -> list[ResolvedLocation]: ...

    async def get_current_conditions(self, coordinates: Coordinates) -> ProviderConditions: ...
