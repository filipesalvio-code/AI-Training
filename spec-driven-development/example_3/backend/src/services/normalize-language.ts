export type GeocodingLanguage = 'pt' | 'en';

export function normalizeLanguage(value: unknown): GeocodingLanguage {
  if (typeof value !== 'string') return 'pt';
  const language = value.toLowerCase();
  if (language === 'pt' || language === 'pt-br') return 'pt';
  if (language === 'en' || language === 'en-us' || language === 'en-gb') return 'en';
  return 'pt';
}
