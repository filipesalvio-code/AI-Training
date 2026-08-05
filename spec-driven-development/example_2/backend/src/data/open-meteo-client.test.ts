import { describe, expect, it, vi } from 'vitest';
import { OpenMeteoClient } from './open-meteo-client';
import type { Environment } from '../config/environment';

const environment: Environment = {
  port: 3000, corsOrigin: '*', geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://forecast.test/forecast', timeoutMs: 2500,
};

const forecast = {
  current: { temperature_2m: 20, apparent_temperature: 19, weather_code: 0, relative_humidity_2m: 50, wind_speed_10m: 5 },
  current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
};

describe('OpenMeteoClient', () => {
  it('sends only the required parameters to both endpoints', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ name: 'Paris', country: 'França', latitude: 48.8, longitude: 2.3 }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(forecast), { status: 200 }));
    const client = new OpenMeteoClient(environment);
    const location = await client.searchFirstLocation('Paris', new AbortController().signal);
    await client.getCurrentConditions(location!.coordinates, new AbortController().signal);
    const geocodingUrl = String(fetchMock.mock.calls[0][0]);
    const forecastUrl = String(fetchMock.mock.calls[1][0]);
    expect(geocodingUrl).toContain('count=1');
    expect(geocodingUrl).toContain('language=pt');
    expect(forecastUrl).toContain('wind_speed_unit=kmh');
    expect(forecastUrl).toContain('temperature_unit=celsius');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockRestore();
  });

  it('normalizes non-success and network failures', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    await expect(new OpenMeteoClient(environment).searchFirstLocation('Paris', new AbortController().signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' });
    fetchMock.mockRestore();
  });
});
