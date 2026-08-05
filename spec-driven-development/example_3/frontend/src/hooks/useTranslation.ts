import { useContext } from 'react';
import { LanguageContext } from '../i18n/language-context';
import type { LanguageContextValue } from '../types/language-context-value';

export function useTranslation(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useTranslation deve ser usado dentro de LanguageProvider');
  return value;
}
