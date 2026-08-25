import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createWeatherResponse } from '../test/weather-fixtures'
import { WeatherResult } from './WeatherResult'

describe('WeatherResult', () => {
  it('presents the complete current weather and attribution', () => {
    render(<WeatherResult result={createWeatherResponse()} />)
    expect(screen.getByRole('heading', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible()
    expect(screen.getByText('Parcialmente nublado')).toBeVisible()
    expect(screen.getByText('24.3°C')).toBeVisible()
    expect(screen.getByText('25.1°C')).toBeVisible()
    expect(screen.getByText('72%')).toBeVisible()
    expect(screen.getByText('12.4 km/h')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/')
    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/')
    expect(within(screen.getByRole('region')).getByText(/Data by/)).toBeVisible()
  })
})
