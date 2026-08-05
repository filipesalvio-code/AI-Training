import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import type { Environment } from './config/environment';
import type { WeatherProvider } from './types/weather-provider';

const environment: Environment = { port: 3000, corsOrigin: '*', geocodingUrl: 'https://geo.test', forecastUrl: 'https://forecast.test', timeoutMs: 2500 };
const location = { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', coordinates: { latitude: -23.5, longitude: -46.6 } };
const conditions = { temperature: 24, apparentTemperature: 25, weatherCode: 2, relativeHumidity: 70, windSpeed: 10 };

function makeProvider(overrides: Partial<WeatherProvider> = {}): WeatherProvider {
  return { searchFirstLocation: vi.fn().mockResolvedValue(location), getCurrentConditions: vi.fn().mockResolvedValue(conditions), ...overrides };
}

describe('GET /weather', () => {
  it('returns the public contract and no-store header', async () => {
    const response = await request(createApp(environment, makeProvider())).get('/weather?city=S%C3%A3o%20Paulo');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.location.city).toBe('São Paulo');
    expect(response.body.source.name).toBe('Open-Meteo');
  });

  it('rejects invalid input without calling the provider', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, provider)).get('/weather?city=a');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_CITY');
    expect(provider.searchFirstLocation).not.toHaveBeenCalled();
  });

  it('converts an empty geocoding result to 404', async () => {
    const provider = makeProvider({ searchFirstLocation: vi.fn().mockResolvedValue(null) });
    const response = await request(createApp(environment, provider)).get('/weather?city=Atlantis');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('CITY_NOT_FOUND');
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });

  it('normalizes provider failures to 503', async () => {
    const provider = makeProvider({ searchFirstLocation: vi.fn().mockRejectedValue(new Error('upstream')) });
    const response = await request(createApp(environment, provider)).get('/weather?city=Lisboa');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('WEATHER_SERVICE_UNAVAILABLE');
  });
});
