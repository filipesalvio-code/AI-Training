import { describe, expect, it } from 'vitest'
import { AppError } from './app-error'

describe('AppError', () => {
  it('preserva o código, status e causa do erro esperado', () => {
    const cause = new Error('causa')
    const error = new AppError({ code: 'INVALID_CITY', statusCode: 400, message: 'Cidade inválida', cause })

    expect(error).toMatchObject({ name: 'AppError', code: 'INVALID_CITY', statusCode: 400, message: 'Cidade inválida' })
    expect(error.cause).toBe(cause)
  })
})
