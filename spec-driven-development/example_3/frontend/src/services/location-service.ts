import { API_ERROR_MESSAGES, isApiErrorCode } from '../types/api-error';
import type { ApiError } from '../types/api-error';
import type { LocationSuggestion } from '../types/location-suggestion';

export class LocationServiceError extends Error {
  constructor(public readonly apiError: ApiError) {
    super(apiError.message);
    this.name = 'LocationServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSuggestion(value: unknown): value is LocationSuggestion {
  if (!isRecord(value) || !isRecord(value.coordinates)) return false;
  const coordinates = value.coordinates;
  return typeof value.city === 'string' && Boolean(value.city.trim()) && typeof value.country === 'string'
    && Boolean(value.country.trim()) && (typeof value.administrativeArea === 'string' || value.administrativeArea === null)
    && isLatitude(coordinates.latitude) && isLongitude(coordinates.longitude);
}

function isLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

function parseError(value: unknown, status: number): ApiError {
  if (isRecord(value) && isRecord(value.error) && isApiErrorCode(value.error.code)) {
    const code = value.error.code;
    return { code, message: API_ERROR_MESSAGES[code] };
  }
  const code = status === 400 ? 'INVALID_LOCATION_QUERY' : 'LOCATION_SERVICE_UNAVAILABLE';
  return { code, message: API_ERROR_MESSAGES[code] };
}

export async function searchLocations(query: string, signal: AbortSignal): Promise<LocationSuggestion[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const url = new URL('/locations', baseUrl);
  url.searchParams.set('query', query);
  try {
    const response = await fetch(url, { signal });
    const payload: unknown = await response.json();
    if (!response.ok) throw new LocationServiceError(parseError(payload, response.status));
    if (!isRecord(payload) || !Array.isArray(payload.suggestions) || !payload.suggestions.every(isSuggestion)) {
      throw new LocationServiceError({ code: 'LOCATION_SERVICE_UNAVAILABLE', message: API_ERROR_MESSAGES.LOCATION_SERVICE_UNAVAILABLE });
    }
    return payload.suggestions;
  } catch (error: unknown) {
    if (error instanceof LocationServiceError || signal.aborted) throw error;
    throw new LocationServiceError({ code: 'LOCATION_SERVICE_UNAVAILABLE', message: API_ERROR_MESSAGES.LOCATION_SERVICE_UNAVAILABLE });
  }
}
