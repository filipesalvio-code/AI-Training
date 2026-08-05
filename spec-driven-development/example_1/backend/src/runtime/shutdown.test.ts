import type { Server } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createShutdownHandler } from './shutdown'

const fakeExit = (codes: number[]) => (code?: number): never => {
  codes.push(code ?? 0)
  return undefined as never
}

afterEach(() => {
  vi.useRealTimers()
})

describe('shutdown handler', () => {
  it('fecha o servidor uma única vez e ignora sinais repetidos', async () => {
    const close = vi.fn((callback: (error?: Error) => void) => callback())
    const codes: number[] = []
    const shutdown = createShutdownHandler({ close } as unknown as Server, fakeExit(codes))

    await shutdown('SIGTERM')
    await shutdown('SIGINT')

    expect(close).toHaveBeenCalledOnce()
    expect(codes).toEqual([0])
  })

  it('retorna código de erro quando o servidor não fecha', async () => {
    const close = vi.fn((callback: (error?: Error) => void) => callback(new Error('close failed')))
    const codes: number[] = []
    const shutdown = createShutdownHandler({ close } as unknown as Server, fakeExit(codes))

    await shutdown('SIGTERM')

    expect(codes).toEqual([1])
  })

  it('encerra quando o prazo de dez segundos é excedido', async () => {
    vi.useFakeTimers()
    const close = vi.fn()
    const codes: number[] = []
    const shutdown = createShutdownHandler({ close } as unknown as Server, fakeExit(codes))
    const result = shutdown('SIGTERM')

    await vi.advanceTimersByTimeAsync(10000)
    await result

    expect(codes).toEqual([1])
  })
})
