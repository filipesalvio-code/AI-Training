import { describe, expect, it, vi } from 'vitest'
import { createLogger } from './logger'

describe('logger', () => {
  it('emite JSON estruturado e remove campos sensíveis', () => {
    const info = vi.fn()
    const log = createLogger({ info, error: vi.fn() })

    log.info('weather_query_completed', { requestId: 'request-1', city: 'São Paulo', status: 200 })

    const entry = JSON.parse(info.mock.calls[0][0] as string) as Record<string, unknown>
    expect(entry).toMatchObject({ event: 'weather_query_completed', requestId: 'request-1', status: 200 })
    expect(entry.city).toBeUndefined()
  })

  it('registra somente o tipo sanitizado da causa', () => {
    const error = vi.fn()
    const log = createLogger({ info: vi.fn(), error })

    log.error('unexpected_error', new Error('detalhe privado'), { route: '/health' })

    expect(error.mock.calls[0][0]).toContain('"cause":"Error"')
    expect(error.mock.calls[0][0]).not.toContain('detalhe privado')
  })
})
