import cors from 'cors'
import express, { type Express } from 'express'
import { createErrorHandler } from './middleware/error-handler'
import { requestIdMiddleware } from './middleware/request-id'
import { healthRoute } from './routes/health-route'
import { createWeatherRoute } from './routes/weather-route'
import { OpenMeteoClient } from './data/open-meteo-client'
import { GetCurrentWeather } from './services/get-current-weather'
import type { WeatherProvider } from './types/weather-provider'

export type AppOptions = { corsOrigin?: string; weatherProvider?: WeatherProvider; weatherTimeoutMs?: number }

export function createApp(options: AppOptions = {}): Express {
  const app = express()
  const provider = options.weatherProvider ?? new OpenMeteoClient()
  const weatherService = new GetCurrentWeather(provider, options.weatherTimeoutMs)
  app.use(cors({ origin: options.corsOrigin ?? '*' }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(requestIdMiddleware)
  app.get('/health', healthRoute)
  app.get('/weather', createWeatherRoute(weatherService))
  app.use(createErrorHandler())
  return app
}
