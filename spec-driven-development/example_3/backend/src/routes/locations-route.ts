import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { SearchLocations } from '../services/search-locations';

export function locationsRoute(useCase: SearchLocations): RequestHandler {
  return async (request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    const query = request.query.query;
    if (Array.isArray(query) || (query !== undefined && typeof query !== 'string')) {
      next(new AppError('INVALID_LOCATION_QUERY', 400));
      return;
    }
    try {
      response.json(await useCase.execute(query));
    } catch (error: unknown) {
      next(error);
    }
  };
}
