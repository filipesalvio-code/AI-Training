import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherResult } from './WeatherResult';

const weather = {
  location: { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil' },
  current: { temperature: 24.3, apparentTemperature: 25.1, condition: 'Parcialmente nublado', relativeHumidity: 72, windSpeed: 12.4 },
  units: { temperature: '°C' as const, apparentTemperature: '°C' as const, relativeHumidity: '%' as const, windSpeed: 'km/h' as const },
  source: { name: 'Open-Meteo' as const, url: 'https://open-meteo.com/', license: 'CC BY 4.0' as const, licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

describe('WeatherResult', () => {
  it('presents the complete reading and functional attribution links', () => {
    render(<WeatherResult weather={weather} />);
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    expect(screen.getByText('24.3°C')).toBeVisible();
    expect(screen.getByText('25.1°C')).toBeVisible();
    expect(screen.getByText('72%')).toBeVisible();
    expect(screen.getByText('12.4km/h')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', weather.source.url);
    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', weather.source.licenseUrl);
  });
});
