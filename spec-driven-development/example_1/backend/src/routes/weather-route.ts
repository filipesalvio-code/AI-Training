import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../errors/app-error'
import { logger, type Logger } from '../observability/logger'
import { GetCurrentWeather } from '../services/get-current-weather'

export function createWeatherRoute(service: GetCurrentWeather, log: Logger = logger): RequestHandler {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const startedAt = Date.now()
    response.setHeader('Cache-Control', 'no-store')
    try {
      const weather = await service.execute(request.query.city)
      log.info('weather_query_completed', { requestId: response.locals.requestId, route: request.path, status: 200, outcome: 'success', durationMs: Date.now() - startedAt })
      response.json(weather)
    } catch (error: unknown) {
      const status = error instanceof AppError ? error.statusCode : 500
      const outcome = error instanceof AppError ? error.code : 'INTERNAL_ERROR'
      log.info('weather_query_completed', { requestId: response.locals.requestId, route: request.path, status, outcome, durationMs: Date.now() - startedAt })
      next(error)
    }
  }
}
