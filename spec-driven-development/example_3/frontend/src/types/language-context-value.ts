import type { Language } from './language';
import type { TranslationKey } from './translation-key';

export type LanguageContextValue = {
  language: Language;
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
};
