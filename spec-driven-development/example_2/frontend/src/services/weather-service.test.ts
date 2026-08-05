import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchWeather } from './weather-service';

const result = {
  location: { city: 'Lisboa', administrativeArea: null, country: 'Portugal' },
  current: { temperature: 20, apparentTemperature: 19, condition: 'Céu limpo', relativeHumidity: 50, windSpeed: 5 },
  units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => vi.restoreAllMocks());

describe('searchWeather', () => {
  it('calls only the backend weather endpoint and parses success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(result), { status: 200 }));
    await expect(searchWeather('São Paulo', new AbortController().signal)).resolves.toEqual(result);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/weather?city=S%C3%A3o+Paulo');
  });

  it('normalizes API errors and rejects malformed success payloads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'CITY_NOT_FOUND', message: 'internal' } }), { status: 404 }));
    await expect(searchWeather('X', new AbortController().signal)).rejects.toMatchObject({ apiError: expect.objectContaining({ code: 'CITY_NOT_FOUND' }) });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await expect(searchWeather('X', new AbortController().signal)).rejects.toMatchObject({ apiError: { code: 'WEATHER_SERVICE_UNAVAILABLE' } });
  });
});
