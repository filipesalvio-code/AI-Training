import type { RequestHandler } from 'express';

export const healthRoute: RequestHandler = (_request, response) => {
  response.json({ status: 'healthy', timestamp: new Date().toISOString() });
};
