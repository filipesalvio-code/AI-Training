import type { TemperatureUnit } from '../types/temperature-unit';

const FAHRENHEIT_NUMERATOR = 9;
const FAHRENHEIT_DENOMINATOR = 5;
const FAHRENHEIT_OFFSET = 32;
const CELSIUS_SYMBOL = '°C';
const FAHRENHEIT_SYMBOL = '°F';

export function toFahrenheit(celsius: number): number {
  return celsius * FAHRENHEIT_NUMERATOR / FAHRENHEIT_DENOMINATOR + FAHRENHEIT_OFFSET;
}

export function getUnitSymbol(unit: TemperatureUnit): string {
  return unit === 'celsius' ? CELSIUS_SYMBOL : FAHRENHEIT_SYMBOL;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
  const roundedValue = Math.round(value);
  const normalizedValue = Object.is(roundedValue, -0) ? 0 : roundedValue;
  return `${normalizedValue}${getUnitSymbol(unit)}`;
}
