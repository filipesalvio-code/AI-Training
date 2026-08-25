import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { WeatherCard } from './components/WeatherCard';
import { formatTemperature } from './lib/temperature';
import { fetchWeather } from './services/weather';

const weatherResponse = { location: { name: 'Curitiba', country: 'Brazil' }, current: { temperatureCelsius: 18, apparentTemperatureCelsius: 17, relativeHumidity: 65, windSpeedKmh: 9, weatherCode: 0, isDay: true, observedAt: '2026-07-31T12:00' } };

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('weather panel', () => {
  it('searches a city and shows the returned data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(weatherResponse)));
    render(<App />);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Curitiba' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Check weather' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Curitiba' })).toBeVisible());
    expect(screen.getByText('18°C')).toBeVisible();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/weather?city=Curitiba');
  });

  it('toggles temperatures between Celsius and Fahrenheit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(weatherResponse)));
    render(<App />);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Curitiba' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Check weather' }));
    await screen.findByText('18°C');
    expect(screen.getByText('17°C')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Show in Fahrenheit' }));
    expect(screen.getByText('64°F')).toBeVisible();
    expect(screen.getByText('63°F')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Show in Celsius' }));
    expect(screen.getByText('18°C')).toBeVisible();
  });

  it('shows validation when the form is empty', () => {
    render(<App />);
    fireEvent.submit(screen.getByRole('button', { name: 'Check weather' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a city name');
  });

  it('exibe erro retornado pelo backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'City not found' }), { status: 404 }));
    render(<App />);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Atlantis' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Check weather' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('City not found'));
  });

  it('maps the main weather condition codes', () => {
    const { rerender } = render(<WeatherCard weather={weatherResponse} temperatureUnit="celsius" onTemperatureUnitToggle={() => undefined} />);
    const codes = [2, 55, 75, 95, 40];
    const labels = ['Partly cloudy', 'Rain', 'Snow', 'Thunderstorm', 'Variable conditions'];
    codes.forEach((weatherCode, index) => {
      rerender(<WeatherCard weather={{ ...weatherResponse, current: { ...weatherResponse.current, weatherCode } }} temperatureUnit="celsius" onTemperatureUnitToggle={() => undefined} />);
      expect(screen.getByText(labels[index])).toBeVisible();
    });
  });

  it('formats Celsius and Fahrenheit temperatures', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0°C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });

  it('uses a default message when the backend omits the error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    await expect(fetchWeather('Recife')).rejects.toThrow('Could not fetch weather');
  });
});
