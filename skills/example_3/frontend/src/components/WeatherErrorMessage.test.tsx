import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherErrorMessage } from './WeatherErrorMessage';

describe('WeatherErrorMessage', () => {
  it('exibe a mensagem de cidade não localizada como alerta', () => {
    render(<WeatherErrorMessage message="Cidade não encontrada" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Cidade não encontrada');
  });
});
