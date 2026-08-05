import { TemperatureUnit } from '../types/temperatureUnit';

const FAHRENHEIT_OFFSET = 32;
const FAHRENHEIT_SCALE = 9 / 5;

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const temperature = unit === 'celsius' ? celsius : celsius * FAHRENHEIT_SCALE + FAHRENHEIT_OFFSET;
  const symbol = unit === 'celsius' ? 'C' : 'F';
  return `${Math.round(temperature)}°${symbol}`;
}
