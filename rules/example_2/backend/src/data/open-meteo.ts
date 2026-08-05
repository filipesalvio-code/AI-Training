import type { CurrentWeather, WeatherLocation } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

type GeocodingResponse = { results?: Array<Record<string, unknown>> };
type ForecastResponse = { current?: Record<string, unknown> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo respondeu com status ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function findLocation(city: string): Promise<WeatherLocation | null> {
  const params = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' });
  const data = await readJson(`${GEOCODING_URL}?${params}`) as GeocodingResponse;
  const result = data.results?.[0];
  if (!result || typeof result.name !== 'string' || typeof result.latitude !== 'number' || typeof result.longitude !== 'number') return null;
  return { name: result.name, country: typeof result.country === 'string' ? result.country : '', latitude: result.latitude, longitude: result.longitude, timezone: typeof result.timezone === 'string' ? result.timezone : 'auto' };
}

export async function fetchCurrentWeather(location: WeatherLocation): Promise<CurrentWeather> {
  const params = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day', timezone: 'auto' });
  const data = await readJson(`${WEATHER_URL}?${params}`) as ForecastResponse;
  const current = data.current;
  if (!isRecord(current)) throw new Error('A resposta do clima está incompleta');
  const values = ['temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'wind_speed_10m', 'precipitation', 'weather_code', 'is_day'];
  if (!values.every((key) => typeof current[key] === 'number')) throw new Error('A resposta do clima está inválida');
  return { temperature: current.temperature_2m as number, apparentTemperature: current.apparent_temperature as number, humidity: current.relative_humidity_2m as number, windSpeed: current.wind_speed_10m as number, precipitation: current.precipitation as number, weatherCode: current.weather_code as number, isDay: current.is_day === 1 };
}
