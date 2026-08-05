import { AppError } from '../errors/app-error';
import type { Coordinates } from '../types/coordinates';
import { MAX_LOCATION_SUGGESTIONS } from '../types/location-suggestion';
import type { ResolvedLocation } from '../types/resolved-location';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function getText(record: RecordValue, key: string): string | null {
  return typeof record[key] === 'string' && record[key].trim() ? record[key].trim() : null;
}

export function parseGeocodingResponse(value: unknown): ResolvedLocation[] {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new AppError('LOCATION_SERVICE_UNAVAILABLE', 503);
  }
  return value.results.slice(0, MAX_LOCATION_SUGGESTIONS).map(parseLocation);
}

function parseLocation(value: unknown): ResolvedLocation {
  if (!isRecord(value)) throw new AppError('LOCATION_SERVICE_UNAVAILABLE', 503);
  const city = getText(value, 'name');
  const country = getText(value, 'country');
  const coordinates = getCoordinates(value.latitude, value.longitude);
  if (!city || !country || !coordinates) {
    throw new AppError('LOCATION_SERVICE_UNAVAILABLE', 503);
  }
  return { city, country, countryCode: getCountryCode(value), administrativeArea: getAdministrativeArea(value), coordinates };
}

function getAdministrativeArea(record: RecordValue): string | null {
  return ['admin1', 'admin2', 'admin3', 'admin4'].map((key) => getText(record, key)).find(Boolean) ?? null;
}

function getCoordinates(latitude: unknown, longitude: unknown): Coordinates | null {
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function getCountryCode(record: RecordValue): string | null {
  const countryCode = getText(record, 'country_code');
  return countryCode && /^[a-z]{2}$/iu.test(countryCode) ? countryCode.toUpperCase() : null;
}
