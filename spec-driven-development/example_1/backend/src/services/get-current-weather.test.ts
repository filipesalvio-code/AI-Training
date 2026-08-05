import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ProviderConditions } from '../types/provider-conditions'
import type { ResolvedLocation } from '../types/resolved-location'
import type { WeatherProvider } from '../types/weather-provider'
import { GetCurrentWeather } from './get-current-weather'

afterEach(() => {
  vi.useRealTimers()
})

const location: ResolvedLocation = {
  city: 'São Paulo', administrativeArea: 'São Paulo', country: 'Brasil', coordinates: { latitude: -23.5, longitude: -46.6 },
}
const conditions: ProviderConditions = {
  temperature: 24.3, apparentTemperature: 25.1, weatherCode: 2, relativeHumidity: 72, windSpeed: 12.4,
}

function providerStub(): WeatherProvider {
  return {
    searchFirstLocation: vi.fn(async () => location),
    getCurrentConditions: vi.fn(async () => conditions),
  }
}

describe('GetCurrentWeather', () => {
  it('monta o contrato com a primeira localidade e condições traduzidas', async () => {
    const result = await new GetCurrentWeather(providerStub()).execute(' São   Paulo ')

    expect(result).toMatchObject({ location: { city: location.city, administrativeArea: location.administrativeArea, country: location.country }, current: { temperature: 24.3, condition: 'Parcialmente nublado' }, units: { windSpeed: 'km/h' } })
  })

  it('converte geocodificação sem resultados em 404 e não consulta a previsão', async () => {
    const provider = providerStub()
    vi.mocked(provider.searchFirstLocation).mockResolvedValue(null)

    await expect(new GetCurrentWeather(provider).execute('Lisboa')).rejects.toMatchObject({ code: 'CITY_NOT_FOUND', statusCode: 404 })
    expect(provider.getCurrentConditions).not.toHaveBeenCalled()
  })

  it('compartilha o orçamento e aborta uma consulta pendente sem retry', async () => {
    vi.useFakeTimers()
    const search = vi.fn<WeatherProvider['searchFirstLocation']>((_city, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')))
    }))
    const getConditions = vi.fn<WeatherProvider['getCurrentConditions']>(async () => conditions)
    const provider: WeatherProvider = { searchFirstLocation: search, getCurrentConditions: getConditions }

    const execution = new GetCurrentWeather(provider, 10).execute('Lisboa')
    const rejection = expect(execution).rejects.toMatchObject({ code: 'WEATHER_SERVICE_UNAVAILABLE', statusCode: 503 })
    await vi.advanceTimersByTimeAsync(10)
    await rejection
    expect(search).toHaveBeenCalledOnce()
    expect(getConditions).not.toHaveBeenCalled()
  })
})
