import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from './LanguageProvider';
import { WeatherResult } from './WeatherResult';
import type { TemperatureUnit } from '../types/temperature-unit';

const weather = {
  location: { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', countryCode: 'BR' },
  current: { temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, condition: 'Parcialmente nublado', relativeHumidity: 72, windSpeed: 12.4 },
  units: { temperature: '°C' as const, apparentTemperature: '°C' as const, relativeHumidity: '%' as const, windSpeed: 'km/h' as const },
  source: { name: 'Open-Meteo' as const, url: 'https://open-meteo.com/', license: 'CC BY 4.0' as const, licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => { cleanup(); });

describe('WeatherResult', () => {
  it('displays temperature and apparent temperature in the selected unit', () => {
    renderResult('fahrenheit');
    expect(screen.getByText('76°F')).toBeVisible();
    expect(screen.getByText('77°F')).toBeVisible();
    expect(screen.queryByText('24°C')).not.toBeInTheDocument();
    expect(screen.queryByText('25°C')).not.toBeInTheDocument();
  });

  it('keeps humidity and wind measurements metric in Fahrenheit', () => {
    renderResult('fahrenheit');
    expect(screen.getByText('72%')).toBeVisible();
    expect(screen.getByText('12,4km/h')).toBeVisible();
  });

  it('presents the rounded Celsius reading and functional attribution links', () => {
    renderResult('celsius');
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    expect(screen.getByText('24°C')).toBeVisible();
    expect(screen.getByText('25°C')).toBeVisible();
    expect(screen.getByText('72%')).toBeVisible();
    expect(screen.getByText('12,4km/h')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', weather.source.url);
    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', weather.source.licenseUrl);
  });
});

function renderResult(unit: TemperatureUnit): void {
  render(<LanguageProvider><WeatherResult weather={weather} unit={unit} onUnitChange={vi.fn()} /></LanguageProvider>);
}
