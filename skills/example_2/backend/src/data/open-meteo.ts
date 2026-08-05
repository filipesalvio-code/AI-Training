import { WeatherLocation, CurrentWeather } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

type GeocodingResponse = { results?: Array<{ name: string; country: string; latitude: number; longitude: number }> };
type WeatherResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    is_day?: number;
    time?: string;
  };
};

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo respondeu com status ${response.status}`);
  return response.json() as Promise<T>;
}

export async function findLocation(city: string): Promise<WeatherLocation | null> {
  const params = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' });
  const data = await readJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`);
  const result = data.results?.[0];
  if (!result) return null;
  return { name: result.name, country: result.country, latitude: result.latitude, longitude: result.longitude };
}

export async function fetchCurrentWeather(location: WeatherLocation): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    timezone: 'auto',
  });
  const data = await readJson<WeatherResponse>(`${WEATHER_URL}?${params}`);
  const current = data.current;
  if (!current || Object.values(current).some((value) => value === undefined)) {
    throw new Error('A resposta do clima está incompleta');
  }
  return {
    temperatureCelsius: current.temperature_2m as number,
    apparentTemperatureCelsius: current.apparent_temperature as number,
    relativeHumidity: current.relative_humidity_2m as number,
    windSpeedKmh: current.wind_speed_10m as number,
    weatherCode: current.weather_code as number,
    isDay: current.is_day === 1,
    observedAt: current.time as string,
  };
}
