import type { ErrorRequestHandler } from 'express'
import { AppError } from '../errors/app-error'
import { logger, type Logger } from '../observability/logger'

const DEFAULT_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente em instantes.'

export function createErrorHandler(log: Logger = logger): ErrorRequestHandler {
  return (error: unknown, request, response, next): void => {
    if (response.headersSent) {
      next(error)
      return
    }
    const requestId = response.locals.requestId
    if (error instanceof AppError) {
      log.info('request_error', { requestId, route: request.path, status: error.statusCode, code: error.code })
      response.status(error.statusCode).json({ error: { code: error.code, message: error.message } })
      return
    }
    log.error('unexpected_error', error, { requestId, route: request.path, status: 500 })
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: DEFAULT_MESSAGE } })
  }
}
