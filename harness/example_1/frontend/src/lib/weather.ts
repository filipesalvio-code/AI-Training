const API_BASE_URL = 'http://localhost:3000';

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export class WeatherApiError extends Error {}

async function handleResponse(response: Response): Promise<WeatherData> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new WeatherApiError(body?.error ?? 'Failed to fetch weather data');
  }
  return response.json();
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  const url = new URL(`${API_BASE_URL}/api/weather`);
  url.searchParams.set('city', city);
  const response = await fetch(url);
  return handleResponse(response);
}

export async function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = new URL(`${API_BASE_URL}/api/weather`);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  const response = await fetch(url);
  return handleResponse(response);
}

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Poucas nuvens',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Thunderstorms',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function describeWeatherCode(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] ?? 'Unknown condition';
}
