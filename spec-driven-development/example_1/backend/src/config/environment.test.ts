import { describe, expect, it } from 'vitest'
import { loadEnvironment } from './environment'

describe('loadEnvironment', () => {
  it('aplica os valores padrão', () => {
    const config = loadEnvironment({})

    expect(config).toEqual({
      port: 3000,
      corsOrigin: '*',
      openMeteoGeocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
      openMeteoForecastUrl: 'https://api.open-meteo.com/v1/forecast',
      openMeteoTimeoutMs: 2500,
    })
  })

  it('valida e normaliza configurações fornecidas', () => {
    const config = loadEnvironment({
      PORT: '3001',
      CORS_ORIGIN: 'http://localhost:5173',
    OPEN_METEO_GEOCODING_URL: 'http://localhost:4000/search/',
    OPEN_METEO_FORECAST_URL: 'https://localhost:4000/forecast/',
    OPEN_METEO_TIMEOUT_MS: '500',
    })

    expect(config.port).toBe(3001)
    expect(config.corsOrigin).toBe('http://localhost:5173')
    expect(config.openMeteoGeocodingUrl).toBe('http://localhost:4000/search')
    expect(config.openMeteoForecastUrl).toBe('https://localhost:4000/forecast')
    expect(config.openMeteoTimeoutMs).toBe(500)
  })

  it.each([
    ['PORT', { PORT: '0' }],
    ['OPEN_METEO_TIMEOUT_MS', { OPEN_METEO_TIMEOUT_MS: 'abc' }],
    ['CORS_ORIGIN', { CORS_ORIGIN: 'ftp://localhost' }],
    ['URL', { OPEN_METEO_FORECAST_URL: 'ftp://localhost/weather' }],
  ])('rejeita configuração inválida de %s', (_name, environment) => {
    expect(() => loadEnvironment(environment)).toThrow()
  })

  it('rejeita uma porta fora do limite HTTP', () => {
    expect(() => loadEnvironment({ PORT: '65536' })).toThrow('PORT deve estar entre 1 e 65535')
  })
})
