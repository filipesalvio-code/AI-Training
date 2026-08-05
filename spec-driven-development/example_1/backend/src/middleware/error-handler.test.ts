import type { Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../errors/app-error'
import { createLogger } from '../observability/logger'
import { createErrorHandler } from './error-handler'

function makeResponse(headersSent = false): Response {
  const response = {
    headersSent,
    locals: { requestId: 'request-1' },
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }
  return response as unknown as Response
}

describe('error handler', () => {
  it('serializa erros esperados sem detalhes internos', () => {
    const log = createLogger({ info: vi.fn(), error: vi.fn() })
    const response = makeResponse()

    createErrorHandler(log)(new AppError({ code: 'INVALID_CITY', statusCode: 400, message: 'Mensagem pública' }), { path: '/weather' } as Request, response, vi.fn())

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({ error: { code: 'INVALID_CITY', message: 'Mensagem pública' } })
  })

  it('oculta detalhes de erros inesperados', () => {
    const errorLog = vi.fn()
    const log = createLogger({ info: vi.fn(), error: errorLog })
    const response = makeResponse()

    createErrorHandler(log)(new Error('segredo interno'), { path: '/health' } as Request, response, vi.fn())

    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ error: { code: 'INTERNAL_ERROR', message: expect.stringContaining('inesperado') } })
    expect(errorLog).toHaveBeenCalledOnce()
  })

  it('delega quando a resposta já começou', () => {
    const next = vi.fn()
    const response = makeResponse(true)
    const error = new Error('erro')

    createErrorHandler()(error, { path: '/health' } as Request, response, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
