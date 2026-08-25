from pydantic import BaseModel


class WeatherLocation(BaseModel):
    name: str
    country: str
    latitude: float
    longitude: float


class CurrentWeather(BaseModel):
    temperatureCelsius: float
    apparentTemperatureCelsius: float
    relativeHumidity: float
    windSpeedKmh: float
    weatherCode: int
    isDay: bool
    observedAt: str


class Weather(BaseModel):
    location: WeatherLocation
    current: CurrentWeather
