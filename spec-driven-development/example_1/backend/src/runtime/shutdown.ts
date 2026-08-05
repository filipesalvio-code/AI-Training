import type { Server } from 'node:http'
import { logger } from '../observability/logger'

const SHUTDOWN_TIMEOUT_MS = 10000
type ExitFunction = (code?: number) => never

function closeWithinTimeout(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new Error('Prazo de desligamento excedido'))
      }
    }, SHUTDOWN_TIMEOUT_MS)
    server.close((error?: Error) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timeout)
      error ? reject(error) : resolve()
    })
  })
}

export function createShutdownHandler(server: Server, exit: ExitFunction = process.exit): (signal: string) => Promise<void> {
  let shuttingDown = false
  return async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return
    }
    shuttingDown = true
    logger.info('shutdown_started', { signal })
    try {
      await closeWithinTimeout(server)
      logger.info('shutdown_completed')
      return exit(0)
    } catch (error: unknown) {
      logger.error('shutdown_failed', error)
      return exit(1)
    }
  }
}
