import type { TemperatureUnit } from '../types/temperature-unit';

type TemperatureUnitToggleProps = {
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
};

const unitOptions: { unit: TemperatureUnit; label: string; name: string }[] = [
  { unit: 'celsius', label: '°C', name: 'Celsius (°C)' },
  { unit: 'fahrenheit', label: '°F', name: 'Fahrenheit (°F)' },
];

function getButtonClassName(optionUnit: TemperatureUnit, activeUnit: TemperatureUnit): string {
  const activeClassName = optionUnit === activeUnit ? 'bg-amber-400 font-semibold text-black' : 'bg-slate-800 font-medium text-white hover:bg-slate-700';
  return `min-h-10 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-slate-950 ${activeClassName}`;
}

export function TemperatureUnitToggle({ unit, onUnitChange }: TemperatureUnitToggleProps) {
  return <div role="group" aria-label="Unidade de temperatura" className="inline-flex overflow-hidden rounded-sm border border-slate-600"><button type="button" aria-label={unitOptions[0].name} aria-pressed={unit === unitOptions[0].unit} onClick={() => onUnitChange(unitOptions[0].unit)} className={getButtonClassName(unitOptions[0].unit, unit)}>{unitOptions[0].label}</button><button type="button" aria-label={unitOptions[1].name} aria-pressed={unit === unitOptions[1].unit} onClick={() => onUnitChange(unitOptions[1].unit)} className={getButtonClassName(unitOptions[1].unit, unit)}>{unitOptions[1].label}</button></div>;
}
