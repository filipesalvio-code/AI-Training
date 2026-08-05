import { describe, expect, it } from 'vitest';
import { parseForecastResponse } from './parse-forecast-response';
import { parseGeocodingResponse } from './parse-geocoding-response';

const forecast = {
  current: { temperature_2m: 24.3, apparent_temperature: 25.1, weather_code: 2, relative_humidity_2m: 72, wind_speed_10m: 12.4 },
  current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
};

describe('parseGeocodingResponse', () => {
  it('maps up to five results, metadata and the first available area', () => {
    const results = Array.from({ length: 6 }, (_, index) => ({ name: `City ${index}`, country: 'Country', country_code: 'us', latitude: index, longitude: index, admin2: index === 0 ? 'Area' : undefined }));
    const parsed = parseGeocodingResponse({ results });
    expect(parsed).toHaveLength(5);
    expect(parsed[0]).toMatchObject({ city: 'City 0', country: 'Country', countryCode: 'US', administrativeArea: 'Area' });
    expect(parsed[1].administrativeArea).toBeNull();
  });

  it('preserves an empty result as a successful empty list', () => {
    expect(parseGeocodingResponse({ results: [] })).toEqual([]);
  });

  it('rejects an invalid envelope or item', () => {
    expect(() => parseGeocodingResponse(null)).toThrowError(/Não foi possível buscar/);
    expect(() => parseGeocodingResponse({ results: [{ name: 'X' }] })).toThrowError(/Não foi possível buscar/);
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
