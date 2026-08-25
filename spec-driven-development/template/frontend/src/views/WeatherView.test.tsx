import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWeatherResponse } from '../test/weather-fixtures'
import { WeatherView } from './WeatherView'

function makeResponse(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

function getWorkspace() {
  return within(screen.getByRole('region', { name: 'Weather search' }))
}

describe('WeatherView', () => {
  afterEach(() => {
    cleanup()
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
    const workspace = getWorkspace()
    expect(workspace.getByRole('button', { name: 'Check weather' })).toBeEnabled()
    await user.type(workspace.getByLabelText('Which city do you want to check?'), 'São Paulo')
    await user.click(workspace.getByRole('button', { name: 'Check weather' }))
    expect(workspace.getByRole('status')).toHaveTextContent('Fetching current conditions...')
    expect(workspace.getByRole('form', { name: 'City search' })).toHaveAttribute('aria-busy', 'true')
    expect(workspace.getByRole('button', { name: 'Checking...' })).toBeDisabled()
    resolveFetch(makeResponse(createWeatherResponse()))
    expect(await screen.findByRole('heading', { name: 'São Paulo, São Paulo, Brazil' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toBeVisible()
  })

  it('announces validation and prevents an invalid request', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<WeatherView />)
    const workspace = getWorkspace()
    await user.click(workspace.getByRole('button', { name: 'Check weather' }))
    expect(workspace.getByRole('alert')).toHaveTextContent('Enter a city with at least two characters.')
    expect(workspace.getByLabelText('Which city do you want to check?')).toHaveAttribute('aria-invalid', 'true')
    expect(workspace.getByLabelText('Which city do you want to check?')).toHaveAttribute('aria-describedby', 'city-feedback')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows a new attempt after a city-not-found error', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeResponse({ error: { code: 'CITY_NOT_FOUND', message: 'City not found. Check the name and try again.' } }, 404))
      .mockResolvedValueOnce(makeResponse(createWeatherResponse()))
    vi.stubGlobal('fetch', fetchMock)
    render(<WeatherView />)
    const workspace = getWorkspace()
    const input = workspace.getByLabelText('Which city do you want to check?')
    await user.type(input, 'Atlantis')
    await user.click(workspace.getByRole('button', { name: 'Check weather' }))
    expect(await workspace.findByRole('alert')).toHaveTextContent('City not found.')
    expect(screen.queryByRole('heading', { name: 'São Paulo, São Paulo, Brazil' })).not.toBeInTheDocument()
    await user.clear(input)
    await user.type(input, 'São Paulo')
    await user.click(workspace.getByRole('button', { name: 'Check weather' }))
    expect(await screen.findByRole('heading', { name: 'São Paulo, São Paulo, Brazil' })).toBeVisible()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
