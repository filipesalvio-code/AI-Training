import { parseForecastResponse } from './parse-forecast-response'
import { parseGeocodingResponse } from './parse-geocoding-response'
import { weatherUnavailableError } from '../errors/app-error'
import { logger } from '../observability/logger'
import type { Coordinates } from '../types/coordinates'
import type { ProviderConditions } from '../types/provider-conditions'
import type { ResolvedLocation } from '../types/resolved-location'
import type { WeatherProvider } from '../types/weather-provider'

const DEFAULT_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const DEFAULT_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
type Fetcher = typeof fetch

export type OpenMeteoClientOptions = {
  geocodingUrl?: string
  forecastUrl?: string
  fetcher?: Fetcher
}

export class OpenMeteoClient implements WeatherProvider {
  private readonly geocodingUrl: string
  private readonly forecastUrl: string
  private readonly fetcher: Fetcher

  constructor(options: OpenMeteoClientOptions = {}) {
    this.geocodingUrl = options.geocodingUrl ?? DEFAULT_GEOCODING_URL
    this.forecastUrl = options.forecastUrl ?? DEFAULT_FORECAST_URL
    this.fetcher = options.fetcher ?? fetch
  }

  async searchFirstLocation(city: string, signal: AbortSignal): Promise<ResolvedLocation | null> {
    const url = new URL(this.geocodingUrl)
    url.search = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' }).toString()
    const payload = await this.requestJson(url, signal, 'geocoding')
    return this.parseGeocoding(payload)
  }

  async getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions> {
    const url = new URL(this.forecastUrl)
    url.search = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      current: 'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
    }).toString()
    const payload = await this.requestJson(url, signal, 'forecast')
    return this.parseForecast(payload)
  }

  private parseGeocoding(payload: unknown): ResolvedLocation | null {
    try {
      return parseGeocodingResponse(payload)
    } catch (error: unknown) {
      logger.error('weather_provider_failed', error, { dependency: 'geocoding' })
      throw weatherUnavailableError(error)
    }
  }

  private parseForecast(payload: unknown): ProviderConditions {
    try {
      return parseForecastResponse(payload)
    } catch (error: unknown) {
      logger.error('weather_provider_failed', error, { dependency: 'forecast' })
      throw weatherUnavailableError(error)
    }
  }

  private async requestJson(url: URL, signal: AbortSignal, dependency: string): Promise<unknown> {
    try {
      const response = await this.fetcher(url, { signal })
      if (!response.ok) {
        throw new Error(`External status ${response.status}`)
      }
      return await response.json() as unknown
    } catch (error: unknown) {
      logger.error('weather_provider_failed', error, { dependency })
      throw weatherUnavailableError(error)
    }
  }
}
