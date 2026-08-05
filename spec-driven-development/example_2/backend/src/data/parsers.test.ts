import { describe, expect, it } from 'vitest';
import { parseForecastResponse } from './parse-forecast-response';
import { parseGeocodingResponse } from './parse-geocoding-response';

const forecast = {
  current: { temperature_2m: 24.3, apparent_temperature: 25.1, weather_code: 2, relative_humidity_2m: 72, wind_speed_10m: 12.4 },
  current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
};

describe('parseGeocodingResponse', () => {
  it('selects the first result and first available administrative area', () => {
    const result = parseGeocodingResponse({ results: [{ name: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1, admin2: 'Lisboa' }, { name: 'Other', country: 'X', latitude: 1, longitude: 1 }] });
    expect(result).toMatchObject({ city: 'Lisboa', country: 'Portugal', administrativeArea: 'Lisboa' });
  });

  it('normalizes missing administrative data to null', () => {
    expect(parseGeocodingResponse({ results: [{ name: 'Oslo', country: 'Noruega', latitude: 59.9, longitude: 10.7 }] })).toMatchObject({ administrativeArea: null });
    expect(parseGeocodingResponse({ results: [] })).toBeNull();
  });

  it('rejects invalid external payloads', () => {
    expect(() => parseGeocodingResponse({ results: [{ name: 'X' }] })).toThrowError(/Não foi possível/);
    expect(() => parseGeocodingResponse(null)).toThrowError(/Não foi possível/);
  });
});

describe('parseForecastResponse', () => {
  it('maps current values and units', () => {
    expect(parseForecastResponse(forecast)).toEqual({ temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, relativeHumidity: 72, windSpeed: 12.4 });
  });

  it('rejects missing values, bad units and invalid limits', () => {
    expect(() => parseForecastResponse({ ...forecast, current_units: { ...forecast.current_units, wind_speed_10m: 'mph' } })).toThrowError(/Não foi possível/);
    expect(() => parseForecastResponse({ ...forecast, current: { ...forecast.current, relative_humidity_2m: 101 } })).toThrowError(/Não foi possível/);
    expect(() => parseForecastResponse({ ...forecast, current: { ...forecast.current, weather_code: 999 } })).toThrowError(/Não foi possível/);
    expect(() => parseForecastResponse(undefined)).toThrowError(/Não foi possível/);
  });
});
