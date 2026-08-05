import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationServiceError, searchLocations } from '../services/location-service';
import { API_ERROR_MESSAGES } from '../types/api-error';
import type { ApiError } from '../types/api-error';
import type { LocationSearchState } from '../types/location-search-state';

export const LOCATION_DEBOUNCE_MS = 200;
const USEFUL_CHARACTERS = /[\p{L}\p{N}]/gu;

function normalizeQuery(query: string): string | null {
  const normalized = query.trim().replace(/\s+/gu, ' ');
  return (normalized.match(USEFUL_CHARACTERS) ?? []).length >= 2 ? normalized : null;
}

function getError(error: unknown): ApiError {
  if (error instanceof LocationServiceError) return error.apiError;
  return { code: 'LOCATION_SERVICE_UNAVAILABLE', message: API_ERROR_MESSAGES.LOCATION_SERVICE_UNAVAILABLE };
}

export function useLocationSuggestions(query: string, enabled: boolean): { state: LocationSearchState; dismiss: () => void } {
  const [state, setState] = useState<LocationSearchState>({ status: 'idle' });
  const mounted = useRef(true);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const dismiss = useCallback((): void => {
    requestId.current += 1;
    controller.current?.abort();
    controller.current = null;
    setState({ status: 'idle' });
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  useEffect(() => {
    const normalizedQuery = normalizeQuery(query);
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    controller.current?.abort();
    if (!enabled || !normalizedQuery) {
      setState({ status: 'idle' });
      return undefined;
    }
    setState({ status: 'loading', query: normalizedQuery });
    const timer = window.setTimeout(() => {
      const requestController = new AbortController();
      controller.current = requestController;
      void loadSuggestions(normalizedQuery, requestController.signal, currentRequestId);
    }, LOCATION_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.current?.abort();
    };
  }, [enabled, query]);

  async function loadSuggestions(currentQuery: string, signal: AbortSignal, currentRequestId: number): Promise<void> {
    try {
      const suggestions = await searchLocations(currentQuery, signal);
      if (mounted.current && requestId.current === currentRequestId) setState({ status: 'success', query: currentQuery, suggestions });
    } catch (error: unknown) {
      if (signal.aborted || !mounted.current || requestId.current !== currentRequestId) return;
      setState({ status: 'error', query: currentQuery, error: getError(error) });
    }
  }

  return { state, dismiss };
}
