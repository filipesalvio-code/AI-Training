import { TemperatureUnit } from '../types/temperatureUnit';

type TemperatureUnitToggleProps = { unit: TemperatureUnit; onToggle: () => void };

export function TemperatureUnitToggle({ unit, onToggle }: TemperatureUnitToggleProps) {
  const label = unit === 'celsius' ? 'Exibir em Fahrenheit' : 'Exibir em Celsius';
  return <button type="button" aria-label={label} aria-pressed={unit === 'fahrenheit'} className="temperature-toggle" onClick={onToggle}><span aria-hidden="true">°{unit === 'celsius' ? 'C' : 'F'}</span></button>;
}
