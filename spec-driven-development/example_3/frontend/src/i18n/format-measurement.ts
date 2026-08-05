import type { Language } from '../types/language';

export function formatMeasurement(value: number, unit: string, language: Language): string {
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value)}${unit}`;
}
