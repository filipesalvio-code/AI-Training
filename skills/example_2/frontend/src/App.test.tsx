import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { WeatherCard } from './components/WeatherCard';
import { formatTemperature } from './lib/temperature';
import { fetchWeather } from './services/weather';

const weatherResponse = { location: { name: 'Curitiba', country: 'Brasil' }, current: { temperatureCelsius: 18, apparentTemperatureCelsius: 17, relativeHumidity: 65, windSpeedKmh: 9, weatherCode: 0, isDay: true, observedAt: '2026-07-31T12:00' } };

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('weather panel', () => {
  it('consulta uma cidade e exibe os dados recebidos', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(weatherResponse)));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Curitiba' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Ver clima' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Curitiba' })).toBeVisible());
    expect(screen.getByText('18°C')).toBeVisible();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/weather?city=Curitiba');
  });

  it('alterna temperaturas entre Celsius e Fahrenheit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(weatherResponse)));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Curitiba' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Ver clima' }));
    await screen.findByText('18°C');
    expect(screen.getByText('17°C')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Exibir em Fahrenheit' }));
    expect(screen.getByText('64°F')).toBeVisible();
    expect(screen.getByText('63°F')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Exibir em Celsius' }));
    expect(screen.getByText('18°C')).toBeVisible();
  });

  it('exibe validação quando o formulário está vazio', () => {
    render(<App />);
    fireEvent.submit(screen.getByRole('button', { name: 'Ver clima' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade');
  });

  it('exibe erro retornado pelo backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'Cidade não encontrada' }), { status: 404 }));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Atlantis' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Ver clima' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Cidade não encontrada'));
  });

  it('traduz os principais códigos de condição climática', () => {
    const { rerender } = render(<WeatherCard weather={weatherResponse} temperatureUnit="celsius" onTemperatureUnitToggle={() => undefined} />);
    const codes = [2, 55, 75, 95, 40];
    const labels = ['Parcialmente nublado', 'Chuva', 'Neve', 'Trovoada', 'Condições variáveis'];
    codes.forEach((weatherCode, index) => {
      rerender(<WeatherCard weather={{ ...weatherResponse, current: { ...weatherResponse.current, weatherCode } }} temperatureUnit="celsius" onTemperatureUnitToggle={() => undefined} />);
      expect(screen.getByText(labels[index])).toBeVisible();
    });
  });

  it('formata temperaturas Celsius e Fahrenheit', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0°C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });

  it('usa mensagem padrão quando o backend não informa o erro', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    await expect(fetchWeather('Recife')).rejects.toThrow('Não foi possível consultar o clima');
  });
});
