import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchWeather } from './weather-service';

const location = { city: 'Springfield', administrativeArea: 'Illinois', country: 'Estados Unidos', coordinates: { latitude: 39.8, longitude: -89.6 } };
const result = {
  location: { city: 'Springfield', administrativeArea: 'Illinois', country: 'Estados Unidos', countryCode: 'US' },
  current: { temperature: 20, apparentTemperature: 19, weatherCode: 0, condition: 'Céu limpo', relativeHumidity: 50, windSpeed: 5 },
  units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => vi.restoreAllMocks());

describe('searchWeather', () => {
  it('sends the selected location to the backend and parses success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(result), { status: 200 }));
    await expect(searchWeather(location, new AbortController().signal)).resolves.toEqual(result);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/weather');
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: JSON.stringify({ location }) }));
  });

  it('normalizes API errors and malformed or unavailable responses', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'INVALID_LOCATION', message: 'internal' } }), { status: 400 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockRejectedValueOnce(new Error('network'));
    const signal = new AbortController().signal;
    await expect(searchWeather(location, signal)).rejects.toMatchObject({ apiError: { code: 'INVALID_LOCATION' } });
    await expect(searchWeather(location, signal)).rejects.toMatchObject({ apiError: { code: 'WEATHER_SERVICE_UNAVAILABLE' } });
    await expect(searchWeather(location, signal)).rejects.toMatchObject({ apiError: { code: 'WEATHER_SERVICE_UNAVAILABLE' } });
  });
});
