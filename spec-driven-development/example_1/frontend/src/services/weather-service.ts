import type { ApiErrorCode, ApiErrorDetails } from '../types/api-error'
import { WeatherApiError } from '../types/api-error'
import type { WeatherResponse } from '../types/weather-response'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/u, '')
const INVALID_CITY_MESSAGE = 'Informe uma cidade com pelo menos dois caracteres.'
const NOT_FOUND_MESSAGE = 'Cidade não encontrada. Verifique o nome e tente novamente.'
const UNAVAILABLE_MESSAGE = 'Não foi possível consultar o clima agora. Tente novamente em instantes.'
const INTERNAL_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente em instantes.'
type WeatherService = {
  search: (city: string, signal: AbortSignal) => Promise<WeatherResponse>
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
function isWeatherResponse(value: unknown): value is WeatherResponse {
  if (!isRecord(value) || !isRecord(value.location) || !isRecord(value.current)) return false
  if (!isRecord(value.units) || !isRecord(value.source)) return false
  const location = value.location
  const current = value.current
  const units = value.units
  const source = value.source
  return isNonEmptyString(location.city)
    && (location.administrativeArea === null || isNonEmptyString(location.administrativeArea))
    && isNonEmptyString(location.country)
    && isFiniteNumber(current.temperature)
    && isFiniteNumber(current.apparentTemperature)
    && isNonEmptyString(current.condition)
    && isFiniteNumber(current.relativeHumidity)
    && isFiniteNumber(current.windSpeed)
    && units.temperature === '°C'
    && units.apparentTemperature === '°C'
    && units.relativeHumidity === '%'
    && units.windSpeed === 'km/h'
    && source.name === 'Open-Meteo'
    && isNonEmptyString(source.url)
    && source.license === 'CC BY 4.0'
    && isNonEmptyString(source.licenseUrl)
}
function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return value === 'INVALID_CITY'
    || value === 'CITY_NOT_FOUND'
    || value === 'WEATHER_SERVICE_UNAVAILABLE'
    || value === 'INTERNAL_ERROR'
}
function parseApiError(value: unknown): ApiErrorDetails | null {
  if (!isRecord(value) || !isRecord(value.error)) return null
  const error = value.error
  if (!isApiErrorCode(error.code) || !isNonEmptyString(error.message)) return null
  return { code: error.code, message: error.message }
}
function fallbackError(status: number): ApiErrorDetails {
  if (status === 400) return { code: 'INVALID_CITY', message: INVALID_CITY_MESSAGE }
  if (status === 404) return { code: 'CITY_NOT_FOUND', message: NOT_FOUND_MESSAGE }
  if (status === 503) return { code: 'WEATHER_SERVICE_UNAVAILABLE', message: UNAVAILABLE_MESSAGE }
  return { code: 'INTERNAL_ERROR', message: INTERNAL_ERROR_MESSAGE }
}
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json() as unknown
  } catch {
    return null
  }
}
async function search(city: string, signal: AbortSignal): Promise<WeatherResponse> {
  const query = new URLSearchParams({ city })
  try {
    const response = await fetch(`${API_BASE_URL}/weather?${query.toString()}`, { signal })
    const payload = await readJson(response)
    if (!response.ok) {
      const details = parseApiError(payload) ?? fallbackError(response.status)
      throw new WeatherApiError(details)
    }
    if (!isWeatherResponse(payload)) throw new WeatherApiError(fallbackError(503))
    return payload
  } catch (error: unknown) {
    if (error instanceof WeatherApiError || isAbortError(error)) throw error
    throw new WeatherApiError(fallbackError(503))
  }
}
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export const weatherService: WeatherService = { search }
export type { WeatherService }
