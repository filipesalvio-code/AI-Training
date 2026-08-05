import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import type { Environment } from './config/environment';

const environment: Environment = {
  port: 3000,
  corsOrigin: 'http://localhost:5173',
  geocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastUrl: 'https://api.open-meteo.com/v1/forecast',
  timeoutMs: 2500,
};

describe('health route', () => {
  it('preserves the isolated liveness contract', async () => {
    const response = await request(createApp(environment)).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.timestamp).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });
});
