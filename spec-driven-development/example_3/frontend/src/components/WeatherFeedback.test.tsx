import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherFeedback } from './WeatherFeedback';
import { LanguageProvider } from './LanguageProvider';

describe('WeatherFeedback', () => {
  it('announces loading and weather errors', () => {
    render(<LanguageProvider><WeatherFeedback state={{ status: 'loading' }} /></LanguageProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('Consultando');
    render(<LanguageProvider><WeatherFeedback state={{ status: 'error', error: { code: 'WEATHER_SERVICE_UNAVAILABLE', message: 'Não foi possível consultar' } }} /></LanguageProvider>);
    expect(screen.getByRole('alert')).toHaveTextContent('Confira a localidade');
  });
});
