import { Request, Response, Router } from 'express';
import { getWeather } from '../services/weather';

export const weatherRouter = Router();

weatherRouter.get('/', async (request: Request, response: Response): Promise<void> => {
  const city = typeof request.query.city === 'string' ? request.query.city : '';
  try {
    response.json(await getWeather(city));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Não foi possível consultar o clima';
    const status = message === 'Informe uma cidade válida' ? 400 : 404;
    response.status(status).json({ error: message });
  }
});
