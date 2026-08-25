import { Weather } from '../types/weather';

const API_URL = 'http://localhost:3000/weather';

export async function fetchWeather(city: string): Promise<Weather> {
  const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    const body = await response.json() as { error?: string };
    throw new Error(body.error ?? 'Could not fetch weather');
  }
  return response.json() as Promise<Weather>;
}
