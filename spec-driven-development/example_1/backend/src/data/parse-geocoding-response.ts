import { weatherUnavailableError } from '../errors/app-error'
import type { ResolvedLocation } from '../types/resolved-location'

type RecordValue = Record<string, unknown>

export function parseGeocodingResponse(payload: unknown): ResolvedLocation | null {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw weatherUnavailableError()
  }
  if (payload.results.length === 0) {
    return null
  }
  const result = payload.results[0]
  if (!isRecord(result)) {
    throw weatherUnavailableError()
  }
  return {
    city: readText(result.name),
    administrativeArea: readAdministrativeArea(result),
    country: readText(result.country),
    coordinates: {
      latitude: readCoordinate(result.latitude, -90, 90),
      longitude: readCoordinate(result.longitude, -180, 180),
    },
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw weatherUnavailableError()
  }
  return value.trim()
}

function readAdministrativeArea(result: RecordValue): string | null {
  for (const key of ['admin1', 'admin2', 'admin3', 'admin4']) {
    const value = result[key]
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }
  }
  return null
}

function readCoordinate(value: unknown, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw weatherUnavailableError()
  }
  return value
}
