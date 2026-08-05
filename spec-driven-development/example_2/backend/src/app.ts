import cors from 'cors';
import express, { type Express } from 'express';
import type { Environment } from './config/environment';
import { errorHandler } from './middleware/error-handler';
import { requestContext } from './middleware/request-context';
import { healthRoute } from './routes/health-route';
import { weatherRoute } from './routes/weather-route';
import { OpenMeteoClient } from './data/open-meteo-client';
import { GetCurrentWeather } from './services/get-current-weather';
import type { WeatherProvider } from './types/weather-provider';

export function createApp(environment: Environment, provider?: WeatherProvider): Express {
  const app = express();
  const weatherProvider = provider ?? new OpenMeteoClient(environment);
  const getCurrentWeather = new GetCurrentWeather(weatherProvider, environment.timeoutMs);
  app.use(cors({ origin: environment.corsOrigin }));
  app.use(express.json());
  app.use(requestContext);
  app.get('/health', healthRoute);
  app.get('/weather', weatherRoute(getCurrentWeather));
  app.use(errorHandler);
  return app;
}
