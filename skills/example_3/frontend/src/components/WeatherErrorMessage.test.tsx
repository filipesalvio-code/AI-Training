import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherErrorMessage } from './WeatherErrorMessage';

describe('WeatherErrorMessage', () => {
  it('shows the city-not-found message as an alert', () => {
    render(<WeatherErrorMessage message="City not found" />);

    expect(screen.getByRole('alert')).toHaveTextContent('City not found');
  });
});
