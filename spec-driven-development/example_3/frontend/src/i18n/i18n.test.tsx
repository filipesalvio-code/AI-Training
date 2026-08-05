import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../components/LanguageProvider';
import { LanguageToggle } from '../components/LanguageToggle';
import { en } from './en';
import { countryName } from './country-name';
import { formatMeasurement } from './format-measurement';
import { ptBr } from './pt-br';
import { weatherConditionLabel } from './weather-condition-label';
import { weatherConditionsEn } from './weather-conditions-en';
import { weatherConditionsPtBr } from './weather-conditions-pt-br';
import { useTranslation } from '../hooks/useTranslation';

describe('i18n', () => {
  it('keeps complete and non-empty dictionaries', () => {
    expect(Object.keys(ptBr)).toEqual(Object.keys(en));
    expect(Object.values(ptBr).every(Boolean)).toBe(true);
    expect(Object.values(en).every(Boolean)).toBe(true);
  });

  it('translates every supported weather code and falls back when unknown', () => {
    for (const code of Object.keys(weatherConditionsPtBr).map(Number)) {
      expect(weatherConditionLabel(code, 'pt-BR', 'fallback')).toBe(weatherConditionsPtBr[code]);
      expect(weatherConditionLabel(code, 'en', 'fallback')).toBe(weatherConditionsEn[code]);
    }
    expect(weatherConditionLabel(999, 'en', 'fallback')).toBe('fallback');
  });

  it('formats measurements and country names by language with safe fallback', () => {
    expect(formatMeasurement(24.3, '°C', 'pt-BR')).toBe('24,3°C');
    expect(formatMeasurement(24.3, '°C', 'en')).toBe('24.3°C');
    expect(countryName('DE', 'Alemanha', 'en')).toBe('Germany');
    expect(countryName(null, 'País Exemplo', 'en')).toBe('País Exemplo');
    expect(countryName('invalid', 'País Exemplo', 'en')).toBe('País Exemplo');
  });

  it('switches language in one action with an accessible label', async () => {
    const user = userEvent.setup();
    render(<LanguageProvider><LanguageToggle /><TranslationProbe /></LanguageProvider>);
    const toggle = screen.getByRole('button', { name: 'Idioma atual: português. Trocar para inglês.' });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Current language: English. Switch to Portuguese.' })).toHaveTextContent('EN → PT');
    expect(screen.getByText('Weather right now')).toBeVisible();
  });

  it('synchronizes document metadata and rejects use outside a provider', () => {
    render(<LanguageProvider><TranslationProbe /></LanguageProvider>);
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('Clima de agora');
    expect(() => render(<TranslationProbe />)).toThrow('useTranslation deve ser usado dentro de LanguageProvider');
  });
});

function TranslationProbe() {
  const { t } = useTranslation();
  return <p>{t('header.title')}</p>;
}
