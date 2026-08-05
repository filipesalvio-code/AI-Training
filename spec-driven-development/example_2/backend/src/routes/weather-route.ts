import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { GetCurrentWeather } from '../services/get-current-weather';

export function weatherRoute(useCase: GetCurrentWeather): RequestHandler {
  return async (request, response, next) => {
    const city = request.query.city;
    if (Array.isArray(city) || (city !== undefined && typeof city !== 'string')) {
      next(new AppError('INVALID_CITY', 400));
      return;
    }
    try {
      response.setHeader('Cache-Control', 'no-store');
      response.json(await useCase.execute(city));
    } catch (error: unknown) {
      next(error);
    }
  };
}
