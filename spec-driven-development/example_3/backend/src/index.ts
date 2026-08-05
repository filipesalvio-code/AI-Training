import 'dotenv/config';
import type { Server } from 'node:http';
import { createApp } from './app';
import { loadEnvironment } from './config/environment';
import { logger } from './observability/logger';

export function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error?: Error) => (error ? reject(error) : resolve()));
  });
}

export function startServer(): Server {
  const environment = loadEnvironment();
  const server = createApp(environment).listen(environment.port, () => {
    logger.info('server_started', { route: `http://localhost:${environment.port}` });
  });
  let closing = false;
  const shutdown = async (): Promise<void> => {
    if (closing) return;
    closing = true;
    await closeServer(server);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
