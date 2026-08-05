import { AppError, cityNotFoundError, weatherUnavailableError } from '../errors/app-error'
import { getWeatherCondition } from './weather-condition'
import { normalizeCity } from './normalize-city'
import type { WeatherResponse } from '../types/weather-response'
import type { WeatherProvider } from '../types/weather-provider'
import type { ResolvedLocation } from '../types/resolved-location'
import type { ProviderConditions } from '../types/provider-conditions'

const DEFAULT_TIMEOUT_MS = 2500
const SOURCE = {
  name: 'Open-Meteo',
  url: 'https://open-meteo.com/',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
} as const

export class GetCurrentWeather {
  constructor(private readonly provider: WeatherProvider, private readonly timeoutMs = DEFAULT_TIMEOUT_MS) {}

  async execute(city: unknown): Promise<WeatherResponse> {
    const normalizedCity = normalizeCity(city)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const location = await this.provider.searchFirstLocation(normalizedCity, controller.signal)
      if (location === null) {
        throw cityNotFoundError()
      }
      const conditions = await this.provider.getCurrentConditions(location.coordinates, controller.signal)
      return createWeatherResponse(location, conditions)
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error
      }
      throw weatherUnavailableError(error)
    } finally {
      clearTimeout(timeout)
    }
  }
}

function createWeatherResponse(location: ResolvedLocation, conditions: ProviderConditions): WeatherResponse {
  return {
    location: {
      city: location.city,
      administrativeArea: location.administrativeArea,
      country: location.country,
    },
    current: {
      temperature: conditions.temperature,
      apparentTemperature: conditions.apparentTemperature,
      condition: getWeatherCondition(conditions.weatherCode),
      relativeHumidity: conditions.relativeHumidity,
      windSpeed: conditions.windSpeed,
    },
    units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
    source: SOURCE,
  }
}
