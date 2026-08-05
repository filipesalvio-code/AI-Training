import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { weatherRouter } from './routes/weather';

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_request: Request, response: Response) => {
    response.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  app.use('/weather', weatherRouter);
  app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
    response.status(500).json({ error: 'Something went wrong!', message: error.message });
  });
  return app;
}
