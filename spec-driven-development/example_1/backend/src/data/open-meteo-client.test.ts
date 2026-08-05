import { describe, expect, it, vi } from 'vitest'
import { OpenMeteoClient } from './open-meteo-client'

const geocoding = { results: [{ name: 'São Paulo', country: 'Brasil', admin1: 'São Paulo', latitude: -23.5, longitude: -46.6 }] }
const forecast = {
  current: { temperature_2m: 24, apparent_temperature: 25, weather_code: 0, relative_humidity_2m: 60, wind_speed_10m: 10 },
  current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
}

function response(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } })
}

describe('OpenMeteoClient', () => {
  it('envia os parâmetros mínimos às duas APIs sem retry', async () => {
    const urls: URL[] = []
    const fetcher: typeof fetch = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = new URL(input.toString())
      urls.push(url)
      return response(url.pathname.includes('search') ? geocoding : forecast)
    })
    const client = new OpenMeteoClient({ geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://weather.test/forecast', fetcher })

    await client.searchFirstLocation('São Paulo', new AbortController().signal)
    await client.getCurrentConditions({ latitude: -23.5, longitude: -46.6 }, new AbortController().signal)

    expect(urls[0].searchParams.get('count')).toBe('1')
    expect(urls[0].searchParams.get('language')).toBe('pt')
    expect(urls[1].searchParams.get('current')).toContain('weather_code')
    expect(urls[1].searchParams.get('wind_speed_unit')).toBe('kmh')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('normaliza status externo, falha de rede e JSON inválido', async () => {
    const statusClient = new OpenMeteoClient({ fetcher: vi.fn(async () => response({}, 503)) })
    await expect(statusClient.searchFirstLocation('Lisboa', new AbortController().signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' })

    const networkClient = new OpenMeteoClient({ fetcher: vi.fn<typeof fetch>(async () => { throw new Error('network') }) })
    await expect(networkClient.searchFirstLocation('Lisboa', new AbortController().signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' })

    const invalidJsonClient = new OpenMeteoClient({ fetcher: vi.fn(async () => new Response('{', { status: 200 })) })
    await expect(invalidJsonClient.searchFirstLocation('Lisboa', new AbortController().signal)).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE' })
  })
})
