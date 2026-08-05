import { useState } from 'react';
import { fetchWeather } from '../services/weather';
import type { Weather } from '../types/weather';

export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(city: string): Promise<void> {
    setLoading(true);
    setError('');
    try { setWeather(await fetchWeather(city)); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível consultar o clima'); } finally { setLoading(false); }
  }

  return { weather, loading, error, search };
}
