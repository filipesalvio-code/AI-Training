import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWeatherResponse } from '../test/weather-fixtures'
import { weatherService } from './weather-service'

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('weatherService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('sends the city only to the backend and parses a valid response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(createWeatherResponse()))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    const result = await weatherService.search('São Paulo', controller.signal)

    expect(result.location.city).toBe('São Paulo')
    expect(fetchMock).toHaveBeenCalledWith('/weather?city=S%C3%A3o+Paulo', { signal: controller.signal })
  })

  it('keeps the backend error envelope for a not found city', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({
      error: { code: 'CITY_NOT_FOUND', message: 'City not found.' },
    }, 404)))

    await expect(weatherService.search('Atlantis', new AbortController().signal)).rejects.toMatchObject({
      code: 'CITY_NOT_FOUND',
      message: 'City not found.',
    })
  })

  it('uses stable messages for invalid external responses and network failures', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeResponse({ invalid: true }))
      .mockResolvedValueOnce(makeResponse({ invalid: true }, 500))
      .mockRejectedValueOnce(new Error('network'))
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal

    await expect(weatherService.search('São Paulo', signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' })
    await expect(weatherService.search('São Paulo', signal)).rejects.toMatchObject({ code: 'INTERNAL_ERROR' })
    await expect(weatherService.search('São Paulo', signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' })
  })

  it('uses the fallback when an error response is not valid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => { throw new Error('invalid json') },
    }))

    await expect(weatherService.search('São Paulo', new AbortController().signal)).rejects.toMatchObject({
      code: 'WEATHER_SERVICE_UNAVAILABLE',
    })
  })

  it('preserves abort errors for the hook to ignore', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    await expect(weatherService.search('São Paulo', new AbortController().signal)).rejects.toBe(abortError)
  })
})
