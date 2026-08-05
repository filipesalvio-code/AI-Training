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
  0: 'Céu limpo',
  1: 'Poucas nuvens',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa densa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante densa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',
  85: 'Pancadas de neve leves',
  86: 'Pancadas de neve fortes',
  95: 'Trovoadas',
  96: 'Trovoadas com granizo leve',
  99: 'Trovoadas com granizo forte',
};

export function describeWeatherCode(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] ?? 'Condição desconhecida';
}
