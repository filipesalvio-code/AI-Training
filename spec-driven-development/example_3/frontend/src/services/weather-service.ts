import { API_ERROR_MESSAGES, isApiErrorCode } from '../types/api-error';
import type { ApiError, ApiErrorCode } from '../types/api-error';
import type { LocationSuggestion } from '../types/location-suggestion';
import type { WeatherResponse } from '../types/weather-response';
export class WeatherServiceError extends Error {
  constructor(public readonly apiError: ApiError) {
    super(apiError.message ?? apiError.code);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWeatherResponse(value: unknown): value is WeatherResponse {
  if (!isRecord(value) || !isRecord(value.location) || !isRecord(value.current) || !isRecord(value.units) || !isRecord(value.source)) return false;
  return typeof value.location.city === 'string' && typeof value.location.country === 'string'
    && (typeof value.location.administrativeArea === 'string' || value.location.administrativeArea === null) && (typeof value.location.countryCode === 'string' || value.location.countryCode === null)
    && typeof value.current.temperature === 'number' && typeof value.current.apparentTemperature === 'number'
    && typeof value.current.weatherCode === 'number' && typeof value.current.condition === 'string' && typeof value.current.relativeHumidity === 'number'
    && typeof value.current.windSpeed === 'number' && value.units.temperature === '°C'
    && value.units.apparentTemperature === '°C' && value.units.relativeHumidity === '%' && value.units.windSpeed === 'km/h'
    && value.source.name === 'Open-Meteo' && typeof value.source.url === 'string' && value.source.license === 'CC BY 4.0'
    && typeof value.source.licenseUrl === 'string';
}

function parseError(value: unknown, status: number): ApiError {
  if (isRecord(value) && isRecord(value.error) && isApiErrorCode(value.error.code)) {
    const code = value.error.code;
    return { code, message: API_ERROR_MESSAGES[code] };
  }
  const code: ApiErrorCode = status === 400 ? 'INVALID_LOCATION' : 'WEATHER_SERVICE_UNAVAILABLE';
  return { code, message: API_ERROR_MESSAGES[code] };
}

export async function searchWeather(location: LocationSuggestion, signal: AbortSignal): Promise<WeatherResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const url = new URL('/weather', baseUrl);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
      signal,
    });
    const payload: unknown = await response.json();
    if (!response.ok) throw new WeatherServiceError(parseError(payload, response.status));
    if (!isWeatherResponse(payload)) throw new WeatherServiceError({ code: 'WEATHER_SERVICE_UNAVAILABLE', message: API_ERROR_MESSAGES.WEATHER_SERVICE_UNAVAILABLE });
    return payload;
  } catch (error: unknown) {
    if (error instanceof WeatherServiceError || signal.aborted) throw error;
    throw new WeatherServiceError({ code: 'WEATHER_SERVICE_UNAVAILABLE', message: API_ERROR_MESSAGES.WEATHER_SERVICE_UNAVAILABLE });
  }
}
