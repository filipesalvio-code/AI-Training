import { AppError } from '../errors/app-error'

const INVALID_CITY_MESSAGE = 'Informe uma cidade com pelo menos dois caracteres.'
const usefulCharacterPattern = /[\p{L}\p{N}]/u

export function normalizeCity(input: unknown): string {
  if (typeof input !== 'string') {
    throw invalidCityError()
  }
  const normalized = input.trim().replace(/\s+/gu, ' ')
  const usefulCharacters = [...normalized].filter((character) => usefulCharacterPattern.test(character))
  if (usefulCharacters.length < 2) {
    throw invalidCityError()
  }
  return normalized
}

function invalidCityError(): AppError {
  return new AppError({ code: 'INVALID_CITY', statusCode: 400, message: INVALID_CITY_MESSAGE })
}
