import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/app-error';
import { GetCurrentWeather } from './get-current-weather';
import { normalizeCity } from './normalize-city';
import { weatherCondition } from './weather-condition';
import type { WeatherProvider } from '../types/weather-provider';

const location = { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', coordinates: { latitude: -23.5, longitude: -46.6 } };
const conditions = { temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, relativeHumidity: 72, windSpeed: 12.4 };

function provider(overrides: Partial<WeatherProvider> = {}): WeatherProvider {
  return {
    searchFirstLocation: vi.fn().mockResolvedValue(location),
    getCurrentConditions: vi.fn().mockResolvedValue(conditions),
    ...overrides,
  };
}

describe('normalizeCity', () => {
  it('collapses spaces and keeps international characters', () => {
    expect(normalizeCity('  São   Paulo  ')).toBe('São Paulo');
    expect(normalizeCity('東京')).toBe('東京');
  });

  it('rejects missing and too short cities', () => {
    expect(() => normalizeCity(undefined)).toThrowError(AppError);
    expect(() => normalizeCity(' a ')).toThrowError(AppError);
  });
});

describe('GetCurrentWeather', () => {
  it('uses the first location and returns the display contract', async () => {
    const weatherProvider = provider();
    const result = await new GetCurrentWeather(weatherProvider, 2500).execute(' São   Paulo ');
    expect(weatherProvider.searchFirstLocation).toHaveBeenCalledWith('São Paulo', expect.any(AbortSignal));
    expect(result.current.condition).toBe('Parcialmente nublado');
    expect(result.units).toEqual({ temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' });
  });

  it('returns not found without requesting conditions', async () => {
    const getCurrentConditions = vi.fn();
    const weatherProvider = provider({ searchFirstLocation: vi.fn().mockResolvedValue(null), getCurrentConditions });
    await expect(new GetCurrentWeather(weatherProvider, 2500).execute('Atlantis')).rejects.toMatchObject({ code: 'CITY_NOT_FOUND', status: 404 });
    expect(getCurrentConditions).not.toHaveBeenCalled();
  });

  it('shares one timeout and does not retry the provider', async () => {
    vi.useFakeTimers();
    const searchFirstLocation = vi.fn((_city: string, signal: AbortSignal) => new Promise<null>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    const weatherProvider = provider({ searchFirstLocation });
    const promise = new GetCurrentWeather(weatherProvider, 2500).execute('Lisboa');
    const rejection = expect(promise).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE', status: 503 });
    await vi.advanceTimersByTimeAsync(2500);
    await rejection;
    expect(searchFirstLocation).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('weatherCondition', () => {
  it('translates every supported WMO code', () => {
    const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
    expect(codes.map(weatherCondition)).toHaveLength(codes.length);
  });

  it('rejects an unknown code', () => {
    expect(() => weatherCondition(999)).toThrowError(AppError);
  });
});
