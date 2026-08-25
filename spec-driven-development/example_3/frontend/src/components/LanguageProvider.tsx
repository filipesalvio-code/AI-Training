import { useState, type ReactNode } from 'react';
import { LanguageContext } from '../i18n/language-context';
import { translate } from '../i18n/translations';
import { useDocumentLanguage } from '../hooks/useDocumentLanguage';
import type { Language } from '../types/language';

type LanguageProviderProps = { children: ReactNode };

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');
  const t = (key: Parameters<typeof translate>[1]): string => translate(language, key);
  const toggleLanguage = (): void => setLanguage((current) => current === 'pt-BR' ? 'en' : 'pt-BR');
  useDocumentLanguage(language, t('document.title'));
  return <LanguageContext.Provider value={{ language, t, toggleLanguage }}>{children}</LanguageContext.Provider>;
}
