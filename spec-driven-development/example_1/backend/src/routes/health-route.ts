import type { Request, Response } from 'express'

export function healthRoute(_request: Request, response: Response): void {
  response.json({ status: 'healthy', timestamp: new Date().toISOString() })
}
