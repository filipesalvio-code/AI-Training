import 'dotenv/config'
import type { Server } from 'node:http'
import { createApp } from './app'
import { loadEnvironment, type EnvironmentConfig } from './config/environment'
import { OpenMeteoClient } from './data/open-meteo-client'
import { logger } from './observability/logger'
import { createShutdownHandler } from './runtime/shutdown'

export function startServer(config: EnvironmentConfig = loadEnvironment()): Server {
  const weatherProvider = new OpenMeteoClient({ geocodingUrl: config.openMeteoGeocodingUrl, forecastUrl: config.openMeteoForecastUrl })
  const server = createApp({ corsOrigin: config.corsOrigin, weatherProvider, weatherTimeoutMs: config.openMeteoTimeoutMs }).listen(config.port, () => {
    logger.info('server_started', { port: config.port })
  })
  const shutdown = createShutdownHandler(server)
  process.once('SIGTERM', () => void shutdown('SIGTERM'))
  process.once('SIGINT', () => void shutdown('SIGINT'))
  return server
}

if (require.main === module) {
  startServer()
}
