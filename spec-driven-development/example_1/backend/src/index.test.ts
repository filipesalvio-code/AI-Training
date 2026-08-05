import type { Server } from 'node:http'
import { describe, expect, it } from 'vitest'
import { startServer } from './index'

describe('server runtime', () => {
  it('starts with the supplied configuration', async () => {
    const server = startServer({
      port: 0,
      corsOrigin: '*',
      openMeteoGeocodingUrl: 'https://example.com/geocoding',
      openMeteoForecastUrl: 'https://example.com/forecast',
      openMeteoTimeoutMs: 2500,
    })

    await new Promise<void>((resolve) => server.once('listening', resolve))
    expect((server as Server).listening).toBe(true)
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  })
})
