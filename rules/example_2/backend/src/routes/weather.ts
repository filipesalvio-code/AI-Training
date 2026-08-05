import { Router, type Request, type Response } from 'express';
import { getWeather } from '../services/weather';

export const weatherRouter = Router();

weatherRouter.get('/', async (request: Request, response: Response): Promise<void> => {
  const city = typeof request.query.city === 'string' ? request.query.city.trim() : '';
  if (!city) {
    response.status(400).json({ error: 'Informe uma cidade' });
    return;
  }
  if (city.length > 100) {
    response.status(400).json({ error: 'A cidade deve ter no máximo 100 caracteres' });
    return;
  }
  try {
    response.json(await getWeather(city));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível consultar o clima';
    const status = message === 'Cidade não encontrada' ? 404 : 502;
    response.status(status).json({ error: message });
  }
});
