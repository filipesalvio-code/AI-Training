import { describe, expect, it } from 'vitest'
import { parseForecastResponse } from './parse-forecast-response'

const forecast = (current: Record<string, unknown> = {}, units: Record<string, unknown> = {}) => ({
  current: { temperature_2m: 24.3, apparent_temperature: 25.1, weather_code: 2, relative_humidity_2m: 72, wind_speed_10m: 12.4, ...current },
  current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h', ...units },
})

describe('parseForecastResponse', () => {
  it('mapeia campos e unidades métricas', () => {
    expect(parseForecastResponse(forecast())).toEqual({ temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, relativeHumidity: 72, windSpeed: 12.4 })
  })

  it.each([
    forecast({ relative_humidity_2m: 101 }), forecast({ wind_speed_10m: -1 }), forecast({}, { wind_speed_10m: 'm/s' }),
    forecast({ weather_code: 100 }), { current: {}, current_units: {} }, null,
  ])('rejeita payload externo inválido', (payload) => {
    expect(() => parseForecastResponse(payload)).toThrowError(expect.objectContaining({ code: 'WEATHER_SERVICE_UNAVAILABLE' }))
  })
})
