import { en } from './en';
import { ptBr } from './pt-br';
import type { Language } from '../types/language';
import type { TranslationKey } from '../types/translation-key';
import type { Translations } from '../types/translations';

const translations: Record<Language, Translations> = { 'pt-BR': ptBr, en };

export function translate(language: Language, key: TranslationKey): string {
  return translations[language][key];
}

export { translations };
