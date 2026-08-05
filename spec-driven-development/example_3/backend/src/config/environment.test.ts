import { describe, expect, it } from 'vitest';
import { loadEnvironment } from './environment';

describe('loadEnvironment', () => {
  it('uses documented defaults', () => {
    expect(loadEnvironment({})).toEqual({
      port: 3000,
      corsOrigin: 'http://localhost:5173',
      geocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
      forecastUrl: 'https://api.open-meteo.com/v1/forecast',
      timeoutMs: 2500,
    });
  });

  it('loads configured values', () => {
    expect(loadEnvironment({ PORT: '3001', CORS_ORIGIN: 'http://example.test', OPEN_METEO_TIMEOUT_MS: '1000' })).toMatchObject({
      port: 3001,
      corsOrigin: 'http://example.test',
      timeoutMs: 1000,
    });
  });

  it('rejects invalid numeric values', () => {
    expect(() => loadEnvironment({ PORT: '0' })).toThrow('Configuração numérica inválida');
  });
});
