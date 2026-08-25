import { describe, expect, it } from 'vitest';
import { Weather } from '../types/weather';
import { getWeatherTheme } from './weather-theme';

const createWeather = (weatherCode: number, temperatureCelsius = 20, isDay = true): Weather => ({
  location: { name: 'São Paulo', country: 'Brazil' },
  current: { temperatureCelsius, apparentTemperatureCelsius: temperatureCelsius, relativeHumidity: 60, windSpeedKmh: 12, weatherCode, isDay, observedAt: '2026-08-01T12:00:00Z' },
});

describe('getWeatherTheme', () => {
  it('prioritizes the weather condition when choosing the visual theme', () => {
    expect(getWeatherTheme(createWeather(95, 32))).toBe('storm');
    expect(getWeatherTheme(createWeather(63, 28))).toBe('rain');
    expect(getWeatherTheme(createWeather(75, -2))).toBe('snow');
  });

  it('uses temperature for clear daytime conditions', () => {
    expect(getWeatherTheme(createWeather(0, 30))).toBe('clear-hot');
    expect(getWeatherTheme(createWeather(0, 18))).toBe('clear-cool');
  });

  it('uses the night theme after sunset and before any result exists', () => {
    expect(getWeatherTheme(createWeather(0, 29, false))).toBe('night');
    expect(getWeatherTheme(null)).toBe('night');
  });
});
