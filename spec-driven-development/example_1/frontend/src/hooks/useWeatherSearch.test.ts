import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { WeatherApiError } from '../types/api-error'
import type { WeatherService } from '../services/weather-service'
import { createWeatherResponse } from '../test/weather-fixtures'
import { useWeatherSearch } from './useWeatherSearch'

function createService(): { service: WeatherService; search: ReturnType<typeof vi.fn<WeatherService['search']>> } {
  const search = vi.fn<WeatherService['search']>()
  return { service: { search }, search }
}

describe('useWeatherSearch', () => {
  it('validates the city before calling the service', async () => {
    const { service, search } = createService()
    const { result } = renderHook(() => useWeatherSearch(service))

    await act(async () => { await result.current.search('  a  ') })

    expect(search).not.toHaveBeenCalled()
    expect(result.current.state).toEqual({
      status: 'error',
      result: null,
      error: { code: 'INVALID_CITY', message: 'Informe uma cidade com pelo menos dois caracteres.' },
    })
  })

  it('shows loading and blocks duplicate submissions', async () => {
    const { service, search } = createService()
    let resolveSearch: (value: ReturnType<typeof createWeatherResponse>) => void = () => undefined
    const pending = new Promise<ReturnType<typeof createWeatherResponse>>((resolve) => { resolveSearch = resolve })
    search.mockReturnValue(pending)
    const { result } = renderHook(() => useWeatherSearch(service))

    await act(async () => { void result.current.search('São Paulo') })
    await act(async () => { void result.current.search('Rio de Janeiro') })

    expect(result.current.state.status).toBe('loading')
    expect(search).toHaveBeenCalledTimes(1)
    await act(async () => { resolveSearch(createWeatherResponse()); await pending })
    expect(result.current.state.status).toBe('success')
  })

  it('shows not found and allows a new attempt', async () => {
    const { service, search } = createService()
    search.mockRejectedValueOnce(new WeatherApiError({ code: 'CITY_NOT_FOUND', message: 'Cidade não encontrada.' }))
      .mockResolvedValueOnce(createWeatherResponse())
    const { result } = renderHook(() => useWeatherSearch(service))

    await act(async () => { await result.current.search('Atlantis') })
    expect(result.current.state.status).toBe('error')
    expect(result.current.state.error?.code).toBe('CITY_NOT_FOUND')
    await act(async () => { await result.current.search('São Paulo') })
    expect(result.current.state.status).toBe('success')
  })

  it('clears a previous result when an external failure occurs', async () => {
    const { service, search } = createService()
    search.mockResolvedValueOnce(createWeatherResponse())
      .mockRejectedValueOnce(new Error('network'))
    const { result } = renderHook(() => useWeatherSearch(service))

    await act(async () => { await result.current.search('São Paulo') })
    expect(result.current.state.status).toBe('success')
    await act(async () => { await result.current.search('Rio de Janeiro') })
    expect(result.current.state).toEqual({
      status: 'error',
      result: null,
      error: { code: 'WEATHER_SERVICE_UNAVAILABLE', message: 'Não foi possível consultar o clima agora. Tente novamente em instantes.' },
    })
  })

  it('updates the result when rendered inside React StrictMode', async () => {
    const { service, search } = createService()
    search.mockResolvedValue(createWeatherResponse())
    const { result } = renderHook(() => useWeatherSearch(service), { wrapper: StrictMode })

    await act(async () => { await result.current.search('São Paulo') })

    expect(result.current.state.status).toBe('success')
  })
})
