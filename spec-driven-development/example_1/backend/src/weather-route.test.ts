import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from './app'
import type { ProviderConditions } from './types/provider-conditions'
import type { ResolvedLocation } from './types/resolved-location'
import type { WeatherProvider } from './types/weather-provider'

const location: ResolvedLocation = {
  city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', coordinates: { latitude: -23.5, longitude: -46.6 },
}
const conditions: ProviderConditions = {
  temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, relativeHumidity: 72, windSpeed: 12.4,
}

function provider(overrides: Partial<WeatherProvider> = {}): WeatherProvider {
  return {
    searchFirstLocation: vi.fn(async () => location),
    getCurrentConditions: vi.fn(async () => conditions),
    ...overrides,
  }
}

describe('GET /weather', () => {
  it('retorna o contrato 200 com unidades, fonte e no-store', async () => {
    const response = await request(createApp({ weatherProvider: provider() })).get('/weather').query({ city: 'São Paulo' })

    expect(response.status).toBe(200)
    expect(response.body.location).toEqual({ city: location.city, administrativeArea: location.administrativeArea, country: location.country })
    expect(response.body.current.condition).toBe('Parcialmente nublado')
    expect(response.body.source.name).toBe('Open-Meteo')
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('rejeita query inválida sem acessar o provedor', async () => {
    const weatherProvider = provider()
    const response = await request(createApp({ weatherProvider })).get('/weather').query({ city: 'a' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_CITY')
    expect(weatherProvider.searchFirstLocation).not.toHaveBeenCalled()

    const duplicateResponse = await request(createApp({ weatherProvider })).get('/weather').query({ city: ['São Paulo', 'Lisboa'] })
    expect(duplicateResponse.status).toBe(400)
    expect(weatherProvider.searchFirstLocation).not.toHaveBeenCalled()
  })

  it('converte geocodificação vazia em 404 sem consultar previsão', async () => {
    const weatherProvider = provider({ searchFirstLocation: vi.fn(async () => null) })
    const response = await request(createApp({ weatherProvider })).get('/weather').query({ city: 'Cidade' })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('CITY_NOT_FOUND')
    expect(weatherProvider.getCurrentConditions).not.toHaveBeenCalled()
  })

  it('normaliza falhas de geocodificação e previsão em 503', async () => {
    const geocodingFailure = provider({ searchFirstLocation: vi.fn(async () => { throw new Error('network') }) })
    const firstResponse = await request(createApp({ weatherProvider: geocodingFailure })).get('/weather').query({ city: 'Lisboa' })
    expect(firstResponse.status).toBe(503)
    expect(firstResponse.body.error.code).toBe('WEATHER_SERVICE_UNAVAILABLE')

    const forecastFailure = provider({ getCurrentConditions: vi.fn(async () => { throw new Error('timeout') }) })
    const secondResponse = await request(createApp({ weatherProvider: forecastFailure })).get('/weather').query({ city: 'Lisboa' })
    expect(secondResponse.status).toBe(503)
    expect(secondResponse.body.error.code).toBe('WEATHER_SERVICE_UNAVAILABLE')
  })
})
