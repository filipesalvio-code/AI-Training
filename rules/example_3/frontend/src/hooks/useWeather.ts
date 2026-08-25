import { FormEvent, useState } from 'react';
import { fetchWeather } from '../services/weather';
import { Weather } from '../types/weather';

export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchWeather(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = String(formData.get('city') ?? '').trim();
    if (!city) return setError('Enter a city name');
    setIsLoading(true);
    setError(null);
    try { setWeather(await fetchWeather(city)); } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Could not fetch weather');
    } finally { setIsLoading(false); }
  }

  return { weather, isLoading, error, searchWeather };
}
