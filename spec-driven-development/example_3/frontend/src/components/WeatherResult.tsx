import type { WeatherResponse } from '../types/weather-response';
import { SourceAttribution } from './SourceAttribution';
import { TemperatureUnitToggle } from './TemperatureUnitToggle';
import { formatTemperature } from '../lib/temperature';
import { useTranslation } from '../hooks/useTranslation';
import { countryName } from '../i18n/country-name';
import { formatMeasurement } from '../i18n/format-measurement';
import { weatherConditionLabel } from '../i18n/weather-condition-label';
import type { TemperatureUnit } from '../types/temperature-unit';

type WeatherResultProps = { weather: WeatherResponse; unit: TemperatureUnit; onUnitChange: (unit: TemperatureUnit) => void };

export function WeatherResult({ weather, unit, onUnitChange }: WeatherResultProps) {
  const { language, t } = useTranslation();
  const { location, current, units, source } = weather;
  const condition = weatherConditionLabel(current.weatherCode, language, current.condition);
  const locationName = countryName(location.countryCode, location.country, language);
  return <article className="border-t border-slate-700 pt-8" aria-labelledby="weather-result-title"><div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm uppercase tracking-[0.18em] text-amber-300">{t('result.resolvedLocation')}</p><h2 id="weather-result-title" className="mt-3 text-3xl font-semibold tracking-tight text-white">{location.city}</h2><p className="mt-2 text-slate-300">{location.administrativeArea ? `${location.administrativeArea} · ` : ''}{locationName}</p></div><div className="flex flex-col gap-3 lg:items-end lg:text-right"><p className="text-6xl font-semibold tracking-[-0.04em] text-white">{formatTemperature(current.temperature, unit)}</p><TemperatureUnitToggle unit={unit} onUnitChange={onUnitChange} /><p className="mt-2 text-lg text-amber-200">{condition}</p></div></div><dl className="mt-10 grid grid-cols-2 border-y border-slate-700 sm:grid-cols-4"><WeatherMetric label={t('result.apparentTemperature')} value={formatTemperature(current.apparentTemperature, unit)} /><WeatherMetric label={t('result.relativeHumidity')} value={formatMeasurement(current.relativeHumidity, units.relativeHumidity, language)} /><WeatherMetric label={t('result.windSpeed')} value={formatMeasurement(current.windSpeed, units.windSpeed, language)} /><WeatherMetric label={t('result.condition')} value={condition} /></dl><div className="mt-8"><SourceAttribution source={source} /></div></article>;
}

function WeatherMetric({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-slate-700 px-0 py-5 first:pr-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-2 text-base font-medium text-slate-100">{value}</dd></div>;
}
