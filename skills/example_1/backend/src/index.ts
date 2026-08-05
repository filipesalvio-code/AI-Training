import 'dotenv/config';
import { createServer } from 'node:http';
import { createApp } from './app';
import { logger } from './logger';

const port = Number(process.env.PORT ?? 3000);
const server = createServer(createApp());
let isShuttingDown = false;

function shutdown(signal: string): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
  logger.info(`Sinal ${signal} recebido; encerrando servidor`);
}

server.listen(port, () => logger.info(`Servidor iniciado em http://localhost:${port}`));
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
