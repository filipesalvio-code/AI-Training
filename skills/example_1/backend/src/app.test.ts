import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';

afterEach(() => vi.restoreAllMocks());

describe('weather route', () => {
  it('mantém o health check disponível', async () => {
    const response = await request(createApp()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  it('retorna erro de validação quando a cidade não foi informada', async () => {
    const response = await request(createApp()).get('/weather');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Informe uma cidade válida');
  });

  it('retorna o clima para uma cidade válida', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ name: 'Recife', country: 'Brasil', latitude: -8, longitude: -34 }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ current: { temperature_2m: 28, apparent_temperature: 30, relative_humidity_2m: 80, wind_speed_10m: 10, weather_code: 0, is_day: 1, time: '2026-07-31T12:00' } })));

    const response = await request(createApp()).get('/weather?city=Recife');
    expect(response.status).toBe(200);
    expect(response.body.current).toMatchObject({ temperatureCelsius: 28, weatherCode: 0 });
  });
});
