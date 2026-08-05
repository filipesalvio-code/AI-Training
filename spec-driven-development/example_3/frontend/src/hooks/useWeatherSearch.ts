import { useCallback, useEffect, useRef, useState } from 'react';
import { searchWeather, WeatherServiceError } from '../services/weather-service';
import { API_ERROR_MESSAGES } from '../types/api-error';
import type { ApiError } from '../types/api-error';
import type { LocationSuggestion } from '../types/location-suggestion';
import type { WeatherSearchState } from '../types/weather-search-state';

function getError(error: unknown): ApiError {
  if (error instanceof WeatherServiceError) return error.apiError;
  return { code: 'WEATHER_SERVICE_UNAVAILABLE', message: API_ERROR_MESSAGES.WEATHER_SERVICE_UNAVAILABLE };
}

export function useWeatherSearch(): { state: WeatherSearchState; search: (location: LocationSuggestion) => void } {
  const [state, setState] = useState<WeatherSearchState>({ status: 'idle' });
  const mounted = useRef(true);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const search = useCallback((location: LocationSuggestion): void => {
    controller.current?.abort();
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    const requestController = new AbortController();
    controller.current = requestController;
    setState({ status: 'loading' });
    void searchRequest(location, requestController.signal, currentRequestId);
  }, []);

  async function searchRequest(location: LocationSuggestion, signal: AbortSignal, currentRequestId: number): Promise<void> {
    try {
      const data = await searchWeather(location, signal);
      if (mounted.current && requestId.current === currentRequestId) setState({ status: 'success', data });
    } catch (error: unknown) {
      if (signal.aborted || !mounted.current || requestId.current !== currentRequestId) return;
      setState({ status: 'error', error: getError(error) });
    }
  }

  return { state, search };
}
