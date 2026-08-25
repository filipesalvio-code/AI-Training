import type { Weather } from '../types/weather';

const API_URL = 'http://localhost:3000';

export async function fetchWeather(city: string): Promise<Weather> {
  const response = await fetch(`${API_URL}/weather?city=${encodeURIComponent(city)}`);
  const data = await response.json() as Weather | { error?: string };
  if (!response.ok) throw new Error('error' in data && data.error ? data.error : 'Could not fetch weather');
  return data as Weather;
}

export async function checkApiHealth(): Promise<boolean> {
  const response = await fetch(`${API_URL}/health`);
  return response.ok;
}
