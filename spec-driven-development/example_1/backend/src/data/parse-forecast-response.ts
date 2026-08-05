import { weatherUnavailableError } from '../errors/app-error'
import { isKnownWeatherCode } from '../services/weather-condition'
import type { ProviderConditions } from '../types/provider-conditions'

type RecordValue = Record<string, unknown>

const EXPECTED_UNITS = { temperature: '°C', humidity: '%', wind: 'km/h' } as const

export function parseForecastResponse(payload: unknown): ProviderConditions {
  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.current_units)) {
    throw weatherUnavailableError()
  }
  const current = payload.current
  const units = payload.current_units
  validateUnits(units)
  const weatherCode = readInteger(current.weather_code)
  if (!isKnownWeatherCode(weatherCode)) {
    throw weatherUnavailableError()
  }
  return {
    temperature: readNumber(current.temperature_2m, -100, 100),
    apparentTemperature: readNumber(current.apparent_temperature, -100, 100),
    weatherCode,
    relativeHumidity: readNumber(current.relative_humidity_2m, 0, 100),
    windSpeed: readNumber(current.wind_speed_10m, 0, 500),
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateUnits(units: RecordValue): void {
  if (units.temperature_2m !== EXPECTED_UNITS.temperature || units.apparent_temperature !== EXPECTED_UNITS.temperature) {
    throw weatherUnavailableError()
  }
  if (units.relative_humidity_2m !== EXPECTED_UNITS.humidity || units.wind_speed_10m !== EXPECTED_UNITS.wind) {
    throw weatherUnavailableError()
  }
}

function readNumber(value: unknown, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw weatherUnavailableError()
  }
  return value
}

function readInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw weatherUnavailableError()
  }
  return value
}
