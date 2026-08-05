import { describe, expect, it, vi } from 'vitest';
import { OpenMeteoClient } from './open-meteo-client';
import type { Environment } from '../config/environment';

const environment: Environment = { port: 3000, corsOrigin: '*', geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://forecast.test/forecast', timeoutMs: 2500 };
const forecast = { current: { temperature_2m: 20, apparent_temperature: 19, weather_code: 0, relative_humidity_2m: 50, wind_speed_10m: 5 }, current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' } };

describe('OpenMeteoClient', () => {
  it('sends fixed parameters and preserves the result order and limit', async () => {
    const results = Array.from({ length: 5 }, (_, index) => ({ name: `City ${index}`, country: 'Country', country_code: 'us', latitude: index, longitude: index }));
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ results }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(forecast), { status: 200 }));
    try {
      const client = new OpenMeteoClient(environment);
      const locations = await client.searchLocations('Paris', new AbortController().signal);
      await client.getCurrentConditions(locations[0].coordinates, new AbortController().signal);
      const geocodingUrl = String(fetchMock.mock.calls[0][0]);
      const forecastUrl = String(fetchMock.mock.calls[1][0]);
      expect(geocodingUrl).toContain('count=5');
      expect(geocodingUrl).toContain('language=pt');
      expect(geocodingUrl).toContain('format=json');
      expect(forecastUrl).toContain('wind_speed_unit=kmh');
      expect(forecastUrl).toContain('temperature_unit=celsius');
      expect(locations).toHaveLength(5);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it('normalizes location and weather network failures separately', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    try {
      const client = new OpenMeteoClient(environment);
      await expect(client.searchLocations('Paris', new AbortController().signal)).rejects.toMatchObject({ code: 'LOCATION_SERVICE_UNAVAILABLE' });
      await expect(client.getCurrentConditions({ latitude: 1, longitude: 1 }, new AbortController().signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' });
    } finally {
      fetchMock.mockRestore();
    }
  });
});
