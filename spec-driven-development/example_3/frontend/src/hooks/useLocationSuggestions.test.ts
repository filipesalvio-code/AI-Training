import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LOCATION_DEBOUNCE_MS, useLocationSuggestions } from './useLocationSuggestions';
import * as locationService from '../services/location-service';

const suggestions = [{ city: 'Lisboa', administrativeArea: 'Lisboa', country: 'Portugal', coordinates: { latitude: 38.7, longitude: -9.1 } }];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useLocationSuggestions', () => {
  it('shows loading without clearing the query and debounces one request', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ suggestions }), { status: 200 }));
    const { result: hook, rerender } = renderHook(({ query, enabled }) => useLocationSuggestions(query, enabled), { initialProps: { query: 'L', enabled: true } });
    rerender({ query: 'Lisboa', enabled: true });
    expect(hook.current.state).toEqual({ status: 'loading', query: 'Lisboa' });
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(LOCATION_DEBOUNCE_MS));
    expect(hook.current.state).toMatchObject({ status: 'success', query: 'Lisboa' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not call the service below the useful minimum', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const { result: hook } = renderHook(() => useLocationSuggestions(' a ', true));
    await act(async () => vi.advanceTimersByTimeAsync(LOCATION_DEBOUNCE_MS));
    expect(hook.current.state).toEqual({ status: 'idle' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignores an older response after a newer query', async () => {
    vi.useFakeTimers();
    const resolvers: Array<(response: Response) => void> = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>((resolve) => resolvers.push(resolve)));
    const { result: hook, rerender } = renderHook(({ query }) => useLocationSuggestions(query, true), { initialProps: { query: 'Velho' } });
    await act(async () => vi.advanceTimersByTimeAsync(LOCATION_DEBOUNCE_MS));
    rerender({ query: 'Novo' });
    await act(async () => vi.advanceTimersByTimeAsync(LOCATION_DEBOUNCE_MS));
    await act(async () => resolvers[1](new Response(JSON.stringify({ suggestions: [{ ...suggestions[0], city: 'Novo' }] }), { status: 200 })));
    expect(hook.current.state).toMatchObject({ status: 'success', query: 'Novo' });
    await act(async () => resolvers[0](new Response(JSON.stringify({ suggestions }), { status: 200 })));
    expect(hook.current.state).toMatchObject({ status: 'success', query: 'Novo' });
  });

  it('uses the fallback error for an unexpected service failure', async () => {
    vi.useFakeTimers();
    vi.spyOn(locationService, 'searchLocations').mockRejectedValue(new Error('unexpected'));
    const { result: hook } = renderHook(() => useLocationSuggestions('Lisboa', true));
    await act(async () => vi.advanceTimersByTimeAsync(LOCATION_DEBOUNCE_MS));
    expect(hook.current.state).toMatchObject({ status: 'error', error: { code: 'LOCATION_SERVICE_UNAVAILABLE' } });
  });
});
