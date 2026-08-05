import { describe, expect, it } from 'vitest'
import { normalizeCity } from './normalize-city'

describe('normalizeCity', () => {
  it('colapsa espaços e preserva nomes internacionais', () => {
    expect(normalizeCity('  São   Paulo  ')).toBe('São Paulo')
    expect(normalizeCity('東京')).toBe('東京')
  })

  it.each([undefined, null, '', ' ', 'a', '1'])('rejeita cidade inválida: %s', (city) => {
    expect(() => normalizeCity(city)).toThrowError(expect.objectContaining({ code: 'INVALID_CITY', statusCode: 400 }))
  })
})
