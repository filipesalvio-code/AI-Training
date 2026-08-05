import { useCallback, useEffect, useRef, useState } from 'react';
import { searchWeather, WeatherServiceError } from '../services/weather-service';
import type { ApiError } from '../types/api-error';
import type { WeatherSearchState } from '../types/weather-search-state';

const USEFUL_CHARACTERS = /[\p{L}\p{N}]/gu;
const INVALID_CITY: ApiError = { code: 'INVALID_CITY', message: 'Informe uma cidade com pelo menos dois caracteres.' };

function normalizeCity(city: string): string | null {
  const normalized = city.trim().replace(/\s+/gu, ' ');
  return (normalized.match(USEFUL_CHARACTERS) ?? []).length >= 2 ? normalized : null;
}

function getError(error: unknown): ApiError {
  if (error instanceof WeatherServiceError) return error.apiError;
  return { code: 'WEATHER_SERVICE_UNAVAILABLE', message: 'Não foi possível consultar o clima agora. Tente novamente em instantes.' };
}

export function useWeatherSearch(): { state: WeatherSearchState; search: (city: string) => void } {
  const [state, setState] = useState<WeatherSearchState>({ status: 'idle' });
  const mounted = useRef(true);
  const loading = useRef(false);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const search = useCallback((city: string): void => {
    if (loading.current) return;
    const normalizedCity = normalizeCity(city);
    if (!normalizedCity) {
      setState({ status: 'error', error: INVALID_CITY });
      return;
    }
    loading.current = true;
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    const requestController = new AbortController();
    controller.current = requestController;
    setState({ status: 'loading' });
    void searchRequest(normalizedCity, requestController.signal, currentRequestId);
  }, []);

  async function searchRequest(city: string, signal: AbortSignal, currentRequestId: number): Promise<void> {
    try {
      const data = await searchWeather(city, signal);
      if (mounted.current && requestId.current === currentRequestId) setState({ status: 'success', data });
    } catch (error: unknown) {
      if (signal.aborted || !mounted.current || requestId.current !== currentRequestId) return;
      setState({ status: 'error', error: getError(error) });
    } finally {
      if (requestId.current === currentRequestId) loading.current = false;
    }
  }

  return { state, search };
}
