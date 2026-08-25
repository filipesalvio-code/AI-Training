import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WeatherView } from './WeatherView';
import { LanguageProvider } from '../components/LanguageProvider';

const location = { city: 'Lisboa', administrativeArea: null, country: 'Portugal', countryCode: 'PT', coordinates: { latitude: 38.7, longitude: -9.1 } };
const weather = { location: { city: 'Lisboa', administrativeArea: null, country: 'Portugal', countryCode: 'PT' }, current: { temperature: 20, apparentTemperature: 19, weatherCode: 0, condition: 'Céu limpo', relativeHumidity: 50, windSpeed: 5 }, units: { temperature: '°C' as const, apparentTemperature: '°C' as const, relativeHumidity: '%' as const, windSpeed: 'km/h' as const }, source: { name: 'Open-Meteo' as const, url: 'https://open-meteo.com/', license: 'CC BY 4.0' as const, licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' } };

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('WeatherView temperature unit', () => {
  it('hides the unit toggle before a location is selected', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(() => undefined));
    renderView();
    expect(screen.queryByRole('group', { name: 'Temperature unit' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'City name' }), { target: { value: 'Lisboa' } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Searching locations'));
    expect(screen.queryByRole('group', { name: 'Temperature unit' })).not.toBeInTheDocument();
  });

  it('changes units without a second weather request and keeps the result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ suggestions: [location] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(weather), { status: 200 }));
    renderView();
    fireEvent.change(screen.getByRole('combobox', { name: 'City name' }), { target: { value: 'Lisboa' } });
    await waitFor(() => expect(screen.getByRole('option')).toBeVisible());
    fireEvent.pointerDown(screen.getByRole('option'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible());
    fireEvent.click(screen.getByRole('button', { name: 'Fahrenheit (°F)' }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText('68°F')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

function renderView(): void {
  render(<LanguageProvider><WeatherView /></LanguageProvider>);
}
