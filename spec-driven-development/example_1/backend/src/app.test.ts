import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'

describe('health check', () => {
  it('preserva o contrato e gera um request id', async () => {
    const response = await request(createApp({ corsOrigin: 'http://localhost:5173' })).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('healthy')
    expect(response.body.timestamp).toEqual(expect.any(String))
    expect(response.headers['x-request-id']).toEqual(expect.any(String))
  })
})
