import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemperatureUnitToggle } from './TemperatureUnitToggle';

afterEach(() => { cleanup(); });

describe('TemperatureUnitToggle', () => {
  it('exposes the active temperature unit through accessible names and state', () => {
    render(<TemperatureUnitToggle unit="celsius" onUnitChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Temperature unit' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Celsius (°C)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit (°F)' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('notifies the unit selected by the user', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    render(<TemperatureUnitToggle unit="celsius" onUnitChange={onUnitChange} />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit (°F)' }));
    expect(onUnitChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('is keyboard operable with a visible focus style', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    render(<TemperatureUnitToggle unit="celsius" onUnitChange={onUnitChange} />);
    await user.tab();
    const celsiusButton = screen.getByRole('button', { name: 'Celsius (°C)' });
    expect(celsiusButton).toHaveFocus();
    expect(celsiusButton).toHaveClass('focus:ring-amber-200');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onUnitChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('notifies the active unit without changing its exposed state', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    render(<TemperatureUnitToggle unit="celsius" onUnitChange={onUnitChange} />);
    const celsiusButton = screen.getByRole('button', { name: 'Celsius (°C)' });
    await user.click(celsiusButton);
    expect(onUnitChange).toHaveBeenCalledWith('celsius');
    expect(celsiusButton).toHaveAttribute('aria-pressed', 'true');
  });
});
