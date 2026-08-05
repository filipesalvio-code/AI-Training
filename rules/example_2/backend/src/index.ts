import cors from 'cors';
import dotenv from 'dotenv';
import express, { type ErrorRequestHandler } from 'express';
import { weatherRouter } from './routes/weather';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.get('/health', (_request, response) => response.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.use('/weather', weatherRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  response.status(500).json({ error: 'Something went wrong', message });
};

app.use(errorHandler);

const server = app.listen(port, () => console.log(`Servidor disponível em http://localhost:${port}`));
let shuttingDown = false;

function shutdown(): void {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => process.exit(0));
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
