import { fetchCurrentWeather, findLocation } from '../data/open-meteo';
import type { WeatherResult } from '../types/weather';

export async function getWeather(city: string): Promise<WeatherResult> {
  const location = await findLocation(city);
  if (!location) throw new Error('Cidade não encontrada');
  const current = await fetchCurrentWeather(location);
  return { location, current, observedAt: new Date().toISOString() };
}
