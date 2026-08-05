import { AppError } from '../errors/app-error';
import type { Coordinates } from '../types/coordinates';
import type { LocationSuggestion } from '../types/location-suggestion';

type RecordValue = Record<string, unknown>;

export function validateSelectedLocation(value: unknown): LocationSuggestion {
  if (!isRecord(value)) throw new AppError('INVALID_LOCATION', 400);
  const city = getRequiredText(value.city);
  const country = getRequiredText(value.country);
  const administrativeArea = getAdministrativeArea(value.administrativeArea);
  const countryCode = getCountryCode(value.countryCode);
  const coordinates = getCoordinates(value.coordinates);
  if (!city || !country || administrativeArea === undefined || countryCode === undefined || !coordinates) {
    throw new AppError('INVALID_LOCATION', 400);
  }
  return { city, administrativeArea, country, ...(countryCode ? { countryCode } : {}), coordinates };
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function getRequiredText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getAdministrativeArea(value: unknown): string | null | undefined {
  if (value === null) return null;
  return getRequiredText(value) ?? undefined;
}

function getCountryCode(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || !/^[a-z]{2}$/iu.test(value.trim())) return undefined;
  return value.trim().toUpperCase();
}

function getCoordinates(value: unknown): Coordinates | null {
  if (!isRecord(value)) return null;
  const { latitude, longitude } = value;
  if (!isLatitude(latitude) || !isLongitude(longitude)) return null;
  return { latitude, longitude };
}

function isLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}
