import { AppError } from '../errors/app-error';
import type { Coordinates } from '../types/coordinates';
import type { ResolvedLocation } from '../types/resolved-location';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function getText(record: RecordValue, key: string): string | null {
  return typeof record[key] === 'string' && record[key].trim() ? record[key].trim() : null;
}

export function parseGeocodingResponse(value: unknown): ResolvedLocation | null {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503);
  }
  const first = value.results[0];
  if (first === undefined) return null;
  if (!isRecord(first)) throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503);
  const city = getText(first, 'name');
  const country = getText(first, 'country');
  const latitude = first.latitude;
  const longitude = first.longitude;
  const coordinates = getCoordinates(latitude, longitude);
  if (!city || !country || !coordinates) {
    throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503);
  }
  return { city, country, administrativeArea: getAdministrativeArea(first), coordinates };
}

function getAdministrativeArea(record: RecordValue): string | null {
  return ['admin1', 'admin2', 'admin3', 'admin4'].map((key) => getText(record, key)).find(Boolean) ?? null;
}

function getCoordinates(latitude: unknown, longitude: unknown): Coordinates | null {
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}
