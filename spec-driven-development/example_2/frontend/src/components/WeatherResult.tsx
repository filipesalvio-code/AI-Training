import type { WeatherResponse } from '../types/weather-response';
import { SourceAttribution } from './SourceAttribution';

type WeatherResultProps = { weather: WeatherResponse };

export function WeatherResult({ weather }: WeatherResultProps) {
  const { location, current, units, source } = weather;
  return <article className="border-t border-slate-700 pt-8" aria-labelledby="weather-result-title"><div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm uppercase tracking-[0.18em] text-amber-300">Resolved location</p><h2 id="weather-result-title" className="mt-3 text-3xl font-semibold tracking-tight text-white">{location.city}</h2><p className="mt-2 text-slate-300">{location.administrativeArea ? `${location.administrativeArea} · ` : ''}{location.country}</p></div><div className="lg:text-right"><p className="text-6xl font-semibold tracking-[-0.04em] text-white">{current.temperature}{units.temperature}</p><p className="mt-2 text-lg text-amber-200">{current.condition}</p></div></div><dl className="mt-10 grid grid-cols-2 border-y border-slate-700 sm:grid-cols-4"><WeatherMetric label="Feels like" value={`${current.apparentTemperature}${units.apparentTemperature}`} /><WeatherMetric label="Relative humidity" value={`${current.relativeHumidity}${units.relativeHumidity}`} /><WeatherMetric label="Wind speed" value={`${current.windSpeed}${units.windSpeed}`} /><WeatherMetric label="Current condition" value={current.condition} /></dl><div className="mt-8"><SourceAttribution source={source} /></div></article>;
}

function WeatherMetric({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-slate-700 px-0 py-5 first:pr-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"><dt className="text-sm text-slate-400">{label}</dt><dd className="mt-2 text-base font-medium text-slate-100">{value}</dd></div>;
}
