import { createContext } from 'react';
import type { LanguageContextValue } from '../types/language-context-value';

export const LanguageContext = createContext<LanguageContextValue | null>(null);
