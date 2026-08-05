const DEFAULT_PORT = 3000
const DEFAULT_CORS_ORIGIN = '*'
const DEFAULT_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const DEFAULT_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const DEFAULT_TIMEOUT_MS = 2500

export type EnvironmentConfig = {
  port: number
  corsOrigin: string
  openMeteoGeocodingUrl: string
  openMeteoForecastUrl: string
  openMeteoTimeoutMs: number
}

export function loadEnvironment(environment: NodeJS.ProcessEnv = process.env): EnvironmentConfig {
  return {
    port: readPort(environment.PORT),
    corsOrigin: readCorsOrigin(environment.CORS_ORIGIN),
    openMeteoGeocodingUrl: readUrl(environment.OPEN_METEO_GEOCODING_URL, DEFAULT_GEOCODING_URL),
    openMeteoForecastUrl: readUrl(environment.OPEN_METEO_FORECAST_URL, DEFAULT_FORECAST_URL),
    openMeteoTimeoutMs: readPositiveInteger(environment.OPEN_METEO_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 'OPEN_METEO_TIMEOUT_MS'),
  }
}

function readPort(value: string | undefined): number {
  const port = readPositiveInteger(value, DEFAULT_PORT, 'PORT')
  if (port > 65535) {
    throw new Error('PORT deve estar entre 1 e 65535')
  }
  return port
}

function readCorsOrigin(value: string | undefined): string {
  if (value === undefined || value === DEFAULT_CORS_ORIGIN) {
    return DEFAULT_CORS_ORIGIN
  }
  try {
    const origin = new URL(value)
    if (!['http:', 'https:'].includes(origin.protocol)) {
      throw new Error('protocolo inválido')
    }
    return origin.origin
  } catch (error: unknown) {
    throw new Error(`CORS_ORIGIN inválida: ${value}`, { cause: error })
  }
}

function readPositiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined) {
    return fallback
  }
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} deve ser um número inteiro positivo`)
  }
  return parsed
}

function readUrl(value: string | undefined, fallback: string): string {
  const url = value ?? fallback
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('protocolo inválido')
    }
    return parsed.toString().replace(/\/$/, '')
  } catch (error: unknown) {
    throw new Error(`URL inválida: ${url}`, { cause: error })
  }
}
