import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/app-error';
import { GetCurrentWeather } from './get-current-weather';
import { SearchLocations } from './search-locations';
import { normalizeLocationQuery } from './normalize-location-query';
import { weatherCondition } from './weather-condition';
import type { WeatherProvider } from '../types/weather-provider';

const location = { city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', countryCode: 'BR', coordinates: { latitude: -23.5, longitude: -46.6 } };
const conditions = { temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, relativeHumidity: 72, windSpeed: 12.4 };

function provider(overrides: Partial<WeatherProvider> = {}): WeatherProvider {
  return { searchLocations: vi.fn().mockResolvedValue([location]), getCurrentConditions: vi.fn().mockResolvedValue(conditions), ...overrides };
}

describe('normalizeLocationQuery', () => {
  it('collapses spaces and keeps international characters', () => {
    expect(normalizeLocationQuery('  São   Paulo  ')).toBe('São Paulo');
    expect(normalizeLocationQuery('東京')).toBe('東京');
  });

  it('rejects missing, blank and too short queries', () => {
    expect(() => normalizeLocationQuery(undefined)).toThrowError(AppError);
    expect(() => normalizeLocationQuery('   ')).toThrowError(AppError);
    expect(() => normalizeLocationQuery(' a ')).toThrowError(AppError);
  });
});

describe('SearchLocations', () => {
  it('normalizes the query and returns provider results', async () => {
    const weatherProvider = provider();
    const result = await new SearchLocations(weatherProvider, 2500).execute(' São   Paulo ');
    expect(weatherProvider.searchLocations).toHaveBeenCalledWith('São Paulo', expect.any(AbortSignal));
    expect(result.suggestions).toEqual([location]);
  });

  it('does not retry and aborts when the provider exceeds the timeout', async () => {
    vi.useFakeTimers();
    try {
      const searchLocations = vi.fn((_query: string, signal: AbortSignal) => new Promise<never>((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })));
      const promise = new SearchLocations(provider({ searchLocations }), 2500).execute('Lisboa');
      const rejection = expect(promise).rejects.toMatchObject({ code: 'LOCATION_SERVICE_UNAVAILABLE', status: 503 });
      await vi.advanceTimersByTimeAsync(2500);
      await rejection;
      expect(searchLocations).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('GetCurrentWeather', () => {
  it('uses selected coordinates and preserves labels and provider metadata', async () => {
    const weatherProvider = provider();
    const result = await new GetCurrentWeather(weatherProvider, 2500).execute({ location });
    expect(weatherProvider.searchLocations).not.toHaveBeenCalled();
    expect(weatherProvider.getCurrentConditions).toHaveBeenCalledWith(location.coordinates, expect.any(AbortSignal));
    expect(result.location).toEqual({ city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', countryCode: 'BR' });
    expect(result.current).toMatchObject({ weatherCode: 2, condition: 'Parcialmente nublado' });
  });

  it('rejects an invalid selection without requesting conditions', async () => {
    const getCurrentConditions = vi.fn();
    const weatherProvider = provider({ getCurrentConditions });
    await expect(new GetCurrentWeather(weatherProvider, 2500).execute({ location: { ...location, coordinates: { latitude: 200, longitude: -46.6 } } })).rejects.toMatchObject({ code: 'INVALID_LOCATION', status: 400 });
    expect(getCurrentConditions).not.toHaveBeenCalled();
  });

  it('shares one timeout and does not retry the provider', async () => {
    vi.useFakeTimers();
    try {
      const getCurrentConditions = vi.fn((_coordinates, signal: AbortSignal) => new Promise<never>((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })));
      const weatherProvider = provider({ getCurrentConditions });
      const promise = new GetCurrentWeather(weatherProvider, 2500).execute({ location });
      const rejection = expect(promise).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE', status: 503 });
      await vi.advanceTimersByTimeAsync(2500);
      await rejection;
      expect(getCurrentConditions).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
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
