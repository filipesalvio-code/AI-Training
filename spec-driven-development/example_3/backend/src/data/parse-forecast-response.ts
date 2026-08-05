import { AppError } from '../errors/app-error';
import { isKnownWeatherCode } from '../services/weather-condition';
import type { ProviderConditions } from '../types/provider-conditions';

type RecordValue = Record<string, unknown>;
const EXPECTED_UNITS = { temperature: '°C', humidity: '%', wind: 'km/h' } as const;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function getNumber(record: RecordValue, key: string): number | null {
  return typeof record[key] === 'number' && Number.isFinite(record[key]) ? record[key] : null;
}

export function parseForecastResponse(value: unknown): ProviderConditions {
  if (!isRecord(value) || !isRecord(value.current) || !isRecord(value.current_units)) {
    throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503);
  }
  const current = value.current;
  const units = value.current_units;
  const temperature = getNumber(current, 'temperature_2m');
  const apparentTemperature = getNumber(current, 'apparent_temperature');
  const weatherCode = getNumber(current, 'weather_code');
  const relativeHumidity = getNumber(current, 'relative_humidity_2m');
  const windSpeed = getNumber(current, 'wind_speed_10m');
  if (!hasExpectedUnits(units) || temperature === null || apparentTemperature === null || weatherCode === null
    || relativeHumidity === null || windSpeed === null || !Number.isInteger(weatherCode)
    || !isKnownWeatherCode(weatherCode) || relativeHumidity < 0 || relativeHumidity > 100 || windSpeed < 0) {
    throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503);
  }
  return { temperature, apparentTemperature, weatherCode, relativeHumidity, windSpeed };
}

function hasExpectedUnits(units: RecordValue): boolean {
  return units.temperature_2m === EXPECTED_UNITS.temperature
    && units.apparent_temperature === EXPECTED_UNITS.temperature
    && units.relative_humidity_2m === EXPECTED_UNITS.humidity
    && units.wind_speed_10m === EXPECTED_UNITS.wind;
}
