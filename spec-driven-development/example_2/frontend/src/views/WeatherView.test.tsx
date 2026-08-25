import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WeatherView } from './WeatherView';

const weather = {
  location: { city: 'Lisboa', administrativeArea: null, country: 'Portugal' },
  current: { temperature: 20, apparentTemperature: 19, condition: 'Clear sky', relativeHumidity: 50, windSpeed: 5 },
  units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' },
};

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('WeatherView', () => {
  it('announces validation and loading states accessibly', async () => {
    const user = userEvent.setup();
    let resolve: (response: Response) => void = () => undefined;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((done) => { resolve = done; })));
    render(<WeatherView />);
    const input = screen.getByRole('textbox', { name: /City name/ });
    await user.click(screen.getByRole('button', { name: 'Check weather' }));
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('at least two characters');
    await user.type(input, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Check weather' }));
    expect(screen.getByRole('status')).toHaveTextContent('Fetching');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    await actResolve(resolve, weather);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible());
  });

  it('integrates error recovery and success without stale data', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'CITY_NOT_FOUND', message: 'x' } }), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(weather), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<WeatherView />);
    const input = screen.getByRole('textbox', { name: 'City name' });
    fireEvent.change(input, { target: { value: 'Atlantis' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('City not found'));
    fireEvent.change(input, { target: { value: 'Lisboa' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('keeps responses active under React StrictMode', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(weather), { status: 200 })));
    render(<StrictMode><WeatherView /></StrictMode>);
    const input = screen.getByRole('textbox', { name: /City name/ });
    fireEvent.change(input, { target: { value: 'Lisboa' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa' })).toBeVisible());
  });
});

async function actResolve(resolve: (response: Response) => void, value: typeof weather): Promise<void> {
  resolve(new Response(JSON.stringify(value), { status: 200 }));
}
