import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WeatherView } from './WeatherView';
import { LanguageProvider } from '../components/LanguageProvider';

const suggestions = [{ city: 'Lisboa', administrativeArea: null, country: 'Portugal', countryCode: 'PT', coordinates: { latitude: 38.7, longitude: -9.1 } }];
const weather = {
  location: { city: 'Lisboa', administrativeArea: null, country: 'Portugal', countryCode: 'PT' },
  current: { temperature: 20, apparentTemperature: 19, weatherCode: 0, condition: 'Céu limpo', relativeHumidity: 50, windSpeed: 5 },
  units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('WeatherView', () => {
  it('integrates suggestions, selection and structured weather search', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ suggestions }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(weather), { status: 200 }));
    render(<LanguageProvider><WeatherView /></LanguageProvider>);
    const input = screen.getByRole('combobox', { name: 'City name' });
    fireEvent.change(input, { target: { value: 'Lisboa' } });
    await waitFor(() => expect(screen.getByRole('option')).toBeVisible());
    fireEvent.pointerDown(screen.getByRole('option'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible());
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ location: suggestions[0] }) }));
    expect(screen.getByRole('group', { name: 'Temperature unit' })).toBeVisible();
  });

  it('switches interface language without another weather request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ suggestions }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(weather), { status: 200 }));
    render(<LanguageProvider><WeatherView /></LanguageProvider>);
    fireEvent.change(screen.getByRole('combobox', { name: 'City name' }), { target: { value: 'Lisboa' } });
    await waitFor(() => expect(screen.getByRole('option')).toBeVisible());
    fireEvent.pointerDown(screen.getByRole('option'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible());
    fireEvent.click(screen.getByRole('button', { name: 'Current language: English. Switch to Portuguese.' }));
    expect(screen.getByRole('heading', { name: 'Clima de agora' })).toBeVisible();
    expect(screen.getAllByText('Céu limpo')[0]).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
