import { AppError } from '../errors/app-error';

const USEFUL_CHARACTERS = /[\p{L}\p{N}]/gu;

export function normalizeLocationQuery(query: string | undefined): string {
  const normalized = query?.trim().replace(/\s+/gu, ' ') ?? '';
  const usefulCharacters = normalized.match(USEFUL_CHARACTERS) ?? [];
  if (usefulCharacters.length < 2) {
    throw new AppError('INVALID_LOCATION_QUERY', 400);
  }
  return normalized;
}
