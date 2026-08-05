import type { Language } from '../types/language';

export function countryName(countryCode: string | null, fallback: string, language: Language): string {
  if (!countryCode || !/^[A-Z]{2}$/u.test(countryCode)) return fallback;
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(countryCode) ?? fallback;
  } catch {
    return fallback;
  }
}
