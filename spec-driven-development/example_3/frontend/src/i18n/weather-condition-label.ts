import { weatherConditionsEn } from './weather-conditions-en';
import { weatherConditionsPtBr } from './weather-conditions-pt-br';
import type { Language } from '../types/language';

export function weatherConditionLabel(code: number, language: Language, fallback: string): string {
  const conditions = language === 'pt-BR' ? weatherConditionsPtBr : weatherConditionsEn;
  return conditions[code] ?? fallback;
}
