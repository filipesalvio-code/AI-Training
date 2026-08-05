import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import type { Environment } from './config/environment';
import type { WeatherProvider } from './types/weather-provider';

const environment: Environment = { port: 3000, corsOrigin: '*', geocodingUrl: 'https://geo.test', forecastUrl: 'https://forecast.test', timeoutMs: 2500 };
const location = { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', coordinates: { latitude: -23.5, longitude: -46.6 } };
const conditions = { temperature: 24, apparentTemperature: 25, weatherCode: 2, relativeHumidity: 70, windSpeed: 10 };

function makeProvider(overrides: Partial<WeatherProvider> = {}): WeatherProvider {
  return { searchLocations: vi.fn().mockResolvedValue([location]), getCurrentConditions: vi.fn().mockResolvedValue(conditions), ...overrides };
}

describe('GET /locations', () => {
  it('returns up to five localities with no-store', async () => {
    const suggestions = Array.from({ length: 5 }, (_, index) => ({ ...location, city: `Cidade ${index}` }));
    const provider = makeProvider({ searchLocations: vi.fn().mockResolvedValue(suggestions) });
    const response = await request(createApp(environment, provider)).get('/locations?query=spri');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.suggestions).toHaveLength(5);
    expect(provider.searchLocations).toHaveBeenCalledWith('spri', expect.any(AbortSignal));
  });

  it('rejects an insufficient query without calling the provider', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, provider)).get('/locations?query=a');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_LOCATION_QUERY');
    expect(provider.searchLocations).not.toHaveBeenCalled();
  });

  it('returns an empty success response when no locality matches', async () => {
    const provider = makeProvider({ searchLocations: vi.fn().mockResolvedValue([]) });
    const response = await request(createApp(environment, provider)).get('/locations?query=zzzzzz');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ suggestions: [] });
  });

  it('normalizes a locality provider failure to 503', async () => {
    const provider = makeProvider({ searchLocations: vi.fn().mockRejectedValue(new Error('upstream')) });
    const response = await request(createApp(environment, provider)).get('/locations?query=Lisboa');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('LOCATION_SERVICE_UNAVAILABLE');
  });
});

describe('POST /weather', () => {
  it('uses the selected locality and exact coordinates', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, provider)).post('/weather').send({ location });
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.location).toEqual({ city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', countryCode: null });
    expect(provider.searchLocations).not.toHaveBeenCalled();
    expect(provider.getCurrentConditions).toHaveBeenCalledWith(location.coordinates, expect.any(AbortSignal));
  });

  it('rejects an invalid selected locality before requesting weather', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, provider)).post('/weather').send({ location: { ...location, coordinates: { latitude: 200, longitude: -46.6 } } });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_LOCATION');
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });
});
