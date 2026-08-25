import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeatherSearch } from './useWeatherSearch';

const result = {
  location: { city: 'Lisboa', administrativeArea: 'Lisboa', country: 'Portugal' },
  current: { temperature: 20, apparentTemperature: 19, condition: 'Clear sky', relativeHumidity: 50, windSpeed: 5 },
  units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => vi.restoreAllMocks());

describe('useWeatherSearch', () => {
  it('validates before calling the service', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => hook.current.search(' a '));
    expect(hook.current.state).toEqual({ status: 'error', error: { code: 'INVALID_CITY', message: 'Enter a city with at least two characters.' } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('exposes loading and blocks duplicate submissions', async () => {
    let resolve: (response: Response) => void = () => undefined;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((done) => { resolve = done; })));
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => { hook.current.search('Lisboa'); hook.current.search('Porto'); });
    expect(hook.current.state).toEqual({ status: 'loading' });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => resolve(new Response(JSON.stringify(result), { status: 200 })));
    await waitFor(() => expect(hook.current.state.status).toBe('success'));
  });

  it('shows not found and permits a new attempt', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'CITY_NOT_FOUND', message: 'x' } }), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => hook.current.search('Atlantis'));
    await waitFor(() => expect(hook.current.state.status).toBe('error'));
    act(() => hook.current.search('Lisboa'));
    await waitFor(() => expect(hook.current.state.status).toBe('success'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('clears the previous result when the next request fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'WEATHER_SERVICE_UNAVAILABLE', message: 'x' } }), { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => hook.current.search('Lisboa'));
    await waitFor(() => expect(hook.current.state.status).toBe('success'));
    act(() => hook.current.search('Porto'));
    expect(hook.current.state).toEqual({ status: 'loading' });
    await waitFor(() => expect(hook.current.state.status).toBe('error'));
    expect(hook.current.state).not.toHaveProperty('data');
  });
});
