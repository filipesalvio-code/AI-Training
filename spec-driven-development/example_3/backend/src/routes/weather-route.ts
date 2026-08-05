import type { RequestHandler } from 'express';
import { GetCurrentWeather } from '../services/get-current-weather';

export function weatherRoute(useCase: GetCurrentWeather): RequestHandler {
  return async (request, response, next) => {
    try {
      response.setHeader('Cache-Control', 'no-store');
      response.json(await useCase.execute(request.body as unknown));
    } catch (error: unknown) {
      next(error);
    }
  };
}
