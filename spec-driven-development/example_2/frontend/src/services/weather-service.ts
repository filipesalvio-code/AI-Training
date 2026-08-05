import type { ApiError, ApiErrorCode } from '../types/api-error';
import type { WeatherResponse } from '../types/weather-response';

const PUBLIC_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_CITY: 'Informe uma cidade com pelo menos dois caracteres.',
  CITY_NOT_FOUND: 'Cidade não encontrada. Verifique o nome e tente novamente.',
  WEATHER_SERVICE_UNAVAILABLE: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

export class WeatherServiceError extends Error {
  constructor(public readonly apiError: ApiError) {
    super(apiError.message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWeatherResponse(value: unknown): value is WeatherResponse {
  if (!isRecord(value) || !isRecord(value.location) || !isRecord(value.current) || !isRecord(value.units) || !isRecord(value.source)) return false;
  return typeof value.location.city === 'string' && typeof value.location.country === 'string'
    && (typeof value.location.administrativeArea === 'string' || value.location.administrativeArea === null)
    && typeof value.current.temperature === 'number' && typeof value.current.apparentTemperature === 'number'
    && typeof value.current.condition === 'string' && typeof value.current.relativeHumidity === 'number'
    && typeof value.current.windSpeed === 'number' && value.units.temperature === '°C'
    && value.units.apparentTemperature === '°C' && value.units.relativeHumidity === '%' && value.units.windSpeed === 'km/h'
    && value.source.name === 'Open-Meteo' && typeof value.source.url === 'string' && value.source.license === 'CC BY 4.0'
    && typeof value.source.licenseUrl === 'string';
}

function parseError(value: unknown, status: number): ApiError {
  if (isRecord(value) && isRecord(value.error) && typeof value.error.code === 'string' && value.error.code in PUBLIC_MESSAGES) {
    const code = value.error.code as ApiErrorCode;
    return { code, message: PUBLIC_MESSAGES[code] };
  }
  return { code: status === 404 ? 'CITY_NOT_FOUND' : 'WEATHER_SERVICE_UNAVAILABLE', message: PUBLIC_MESSAGES[status === 404 ? 'CITY_NOT_FOUND' : 'WEATHER_SERVICE_UNAVAILABLE'] };
}

export async function searchWeather(city: string, signal: AbortSignal): Promise<WeatherResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const url = new URL('/weather', baseUrl);
  url.searchParams.set('city', city);
  const response = await fetch(url, { signal });
  const payload: unknown = await response.json();
  if (!response.ok) throw new WeatherServiceError(parseError(payload, response.status));
  if (!isWeatherResponse(payload)) throw new WeatherServiceError({ code: 'WEATHER_SERVICE_UNAVAILABLE', message: PUBLIC_MESSAGES.WEATHER_SERVICE_UNAVAILABLE });
  return payload;
}
