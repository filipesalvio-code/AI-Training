import { AppError } from '../errors/app-error';

const USEFUL_CHARACTERS = /[\p{L}\p{N}]/gu;

export function normalizeCity(city: string | undefined): string {
  const normalized = city?.trim().replace(/\s+/gu, ' ') ?? '';
  const usefulCharacters = normalized.match(USEFUL_CHARACTERS) ?? [];
  if (usefulCharacters.length < 2) {
    throw new AppError('INVALID_CITY', 400);
  }
  return normalized;
}
