import { describe, expect, it } from 'vitest'
import { parseGeocodingResponse } from './parse-geocoding-response'

const location = (name: string, extra: Record<string, unknown> = {}) => ({
  name, country: 'Brasil', latitude: -23.5, longitude: -46.6, ...extra,
})

describe('parseGeocodingResponse', () => {
  it('seleciona somente a primeira localidade', () => {
    const result = parseGeocodingResponse({ results: [location('Primeira'), location('Segunda')] })

    expect(result).toEqual({ city: 'Primeira', administrativeArea: null, country: 'Brasil', coordinates: { latitude: -23.5, longitude: -46.6 } })
  })

  it('usa a primeira divisão administrativa disponível ou null', () => {
    expect(parseGeocodingResponse({ results: [location('Cidade', { admin1: '', admin2: 'Região' })] })?.administrativeArea).toBe('Região')
    expect(parseGeocodingResponse({ results: [location('Cidade')] })?.administrativeArea).toBeNull()
  })

  it('retorna null para resultados vazios e rejeita payload inválido', () => {
    expect(parseGeocodingResponse({ results: [] })).toBeNull()
    expect(() => parseGeocodingResponse({ results: [{ name: 'Cidade' }] })).toThrowError(expect.objectContaining({ code: 'WEATHER_SERVICE_UNAVAILABLE' }))
  })
})
