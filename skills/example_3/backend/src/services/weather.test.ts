import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather } from './weather';

const geocodingResponse = { results: [{ name: 'São Paulo', country: 'Brasil', latitude: -23.5, longitude: -46.6 }] };
const forecastResponse = { current: { temperature_2m: 24, apparent_temperature: 25, relative_humidity_2m: 70, wind_speed_10m: 12, weather_code: 1, is_day: 1, time: '2026-07-31T12:00' } };

afterEach(() => vi.restoreAllMocks());

describe('getWeather', () => {
  it('combina localização e clima atual', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(geocodingResponse)))
      .mockResolvedValueOnce(new Response(JSON.stringify(forecastResponse)));

    const weather = await getWeather(' São Paulo ');

    expect(weather.location.name).toBe('São Paulo');
    expect(weather.current.temperatureCelsius).toBe(24);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('recusa cidade curta antes de acessar a API', async () => {
    await expect(getWeather('A')).rejects.toThrow('Informe uma cidade válida');
  });

  it('informa quando a cidade não é encontrada', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ results: [] })));
    await expect(getWeather('Cidade inexistente')).rejects.toThrow('Não encontramos');
  });
});
