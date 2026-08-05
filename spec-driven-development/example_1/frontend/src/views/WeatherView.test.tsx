import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWeatherResponse } from '../test/weather-fixtures'
import { WeatherView } from './WeatherView'

function makeResponse(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

describe('WeatherView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('moves from idle to loading and success with the complete result', async () => {
    const user = userEvent.setup()
    let resolveFetch: (response: Response) => void = () => undefined
    const pendingResponse = new Promise<Response>((resolve) => { resolveFetch = resolve })
    const fetchMock = vi.fn().mockReturnValue(pendingResponse)
    vi.stubGlobal('fetch', fetchMock)
    render(<WeatherView />)
    expect(screen.getByRole('button', { name: 'Buscar clima' })).toBeEnabled()
    await user.type(screen.getByRole('textbox', { name: 'Qual cidade você quer consultar?' }), 'São Paulo')
    await user.click(screen.getByRole('button', { name: 'Buscar clima' }))
    expect(screen.getByRole('status')).toHaveTextContent('Consultando as condições atuais...')
    expect(screen.getByRole('form', { name: 'Busca por cidade' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Consultando...' })).toBeDisabled()
    resolveFetch(makeResponse(createWeatherResponse()))
    expect(await screen.findByRole('heading', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toBeVisible()
  })

  it('announces validation and prevents an invalid request', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<WeatherView />)
    await user.click(screen.getByRole('button', { name: 'Buscar clima' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma cidade com pelo menos dois caracteres.')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'city-feedback')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows a new attempt after a city-not-found error', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeResponse({ error: { code: 'CITY_NOT_FOUND', message: 'Cidade não encontrada. Verifique o nome e tente novamente.' } }, 404))
      .mockResolvedValueOnce(makeResponse(createWeatherResponse()))
    vi.stubGlobal('fetch', fetchMock)
    render(<WeatherView />)
    const input = screen.getByRole('textbox', { name: 'Qual cidade você quer consultar?' })
    await user.type(input, 'Atlantis')
    await user.click(screen.getByRole('button', { name: 'Buscar clima' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Cidade não encontrada.')
    expect(screen.queryByRole('heading', { name: 'São Paulo, São Paulo, Brasil' })).not.toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'São Paulo')
    await user.click(screen.getByRole('button', { name: 'Buscar clima' }))
    expect(await screen.findByRole('heading', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
