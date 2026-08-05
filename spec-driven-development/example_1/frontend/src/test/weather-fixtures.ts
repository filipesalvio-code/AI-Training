import type { WeatherResponse } from '../types/weather-response'

export function createWeatherResponse(): WeatherResponse {
  return {
    location: { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil' },
    current: {
      temperature: 24.3,
      apparentTemperature: 25.1,
      condition: 'Parcialmente nublado',
      relativeHumidity: 72,
      windSpeed: 12.4,
    },
    units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
    source: {
      name: 'Open-Meteo',
      url: 'https://open-meteo.com/',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  }
}
