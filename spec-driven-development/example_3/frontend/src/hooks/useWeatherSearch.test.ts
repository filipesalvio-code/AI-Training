import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeatherSearch } from './useWeatherSearch';
import * as weatherService from '../services/weather-service';

const location = { city: 'Lisboa', administrativeArea: 'Lisboa', country: 'Portugal', countryCode: 'PT', coordinates: { latitude: 38.7, longitude: -9.1 } };
const otherLocation = { ...location, city: 'Porto', coordinates: { latitude: 41.1, longitude: -8.6 } };
const result = {
  location: { city: 'Lisboa', administrativeArea: 'Lisboa', country: 'Portugal', countryCode: 'PT' },
  current: { temperature: 20, apparentTemperature: 19, weatherCode: 0, condition: 'Céu limpo', relativeHumidity: 50, windSpeed: 5 },
  units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => vi.restoreAllMocks());

describe('useWeatherSearch', () => {
  it('exposes loading and sends the structured selection once', async () => {
    let resolve: (response: Response) => void = () => undefined;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>((done) => { resolve = done; }));
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => hook.current.search(location));
    expect(hook.current.state).toEqual({ status: 'loading' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ body: JSON.stringify({ location }) }));
    await act(async () => resolve(new Response(JSON.stringify(result), { status: 200 })));
    await waitFor(() => expect(hook.current.state.status).toBe('success'));
  });

  it('keeps only the response for the latest selected locality', async () => {
    const resolvers: Array<(response: Response) => void> = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>((resolve) => resolvers.push(resolve)));
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => { hook.current.search(location); hook.current.search(otherLocation); });
    await act(async () => resolvers[0](new Response(JSON.stringify(result), { status: 200 })));
    expect(hook.current.state).toEqual({ status: 'loading' });
    const otherResult = { ...result, location: { ...result.location, city: 'Porto' } };
    await act(async () => resolvers[1](new Response(JSON.stringify(otherResult), { status: 200 })));
    await waitFor(() => expect(hook.current.state).toMatchObject({ status: 'success', data: { location: { city: 'Porto' } } }));
  });

  it('uses the fallback error for an unexpected service failure', async () => {
    vi.spyOn(weatherService, 'searchWeather').mockRejectedValue(new Error('unexpected'));
    const { result: hook } = renderHook(() => useWeatherSearch());
    act(() => hook.current.search(location));
    await waitFor(() => expect(hook.current.state).toMatchObject({ status: 'error', error: { code: 'WEATHER_SERVICE_UNAVAILABLE' } }));
  });
});
