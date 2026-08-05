import { describe, expect, it } from 'vitest';
import { formatTemperature, getUnitSymbol, toFahrenheit } from './temperature';

describe('temperature', () => {
  it('converts Celsius values to Fahrenheit with the specified formula', () => {
    expect(toFahrenheit(0)).toBe(32);
    expect(toFahrenheit(23)).toBe(73.4);
    expect(toFahrenheit(-5)).toBe(23);
  });

  it('rounds temperatures after conversion in both units', () => {
    expect(formatTemperature(24.3, 'celsius')).toBe('24°C');
    expect(formatTemperature(24.3, 'fahrenheit')).toBe('76°F');
    expect(formatTemperature(-27.5, 'celsius')).toBe('-27°C');
  });

  it('normalizes negative zero in formatted temperatures', () => {
    expect(formatTemperature(-0.4, 'celsius')).toBe('0°C');
  });

  it('provides the symbol for each temperature unit', () => {
    expect(getUnitSymbol('celsius')).toBe('°C');
    expect(getUnitSymbol('fahrenheit')).toBe('°F');
  });
});
