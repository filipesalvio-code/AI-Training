import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  logger.error('unexpected_error', { requestId: response.locals.requestId, cause: getCause(error) });
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro inesperado. Tente novamente.' } });
};

function getCause(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
