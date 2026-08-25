import { CloudSun, Droplets, MapPin, Thermometer, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import type { WeatherResponse } from '../types/weather-response'
import { SourceAttribution } from './SourceAttribution'

type WeatherResultProps = {
  result: WeatherResponse
}

function formatLocation(result: WeatherResponse): string {
  const { city, administrativeArea, country } = result.location
  return [city, administrativeArea, country].filter(Boolean).join(', ')
}

export function WeatherResult({ result }: WeatherResultProps) {
  const { current, units } = result
  return (
    <section className="animate-[result-in_500ms_ease-out] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(22,63,75,0.1)] sm:p-7" aria-labelledby="weather-result-title" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#1b6172]">
            <MapPin size={16} aria-hidden="true" /> Location found
          </p>
          <h2 id="weather-result-title" className="text-2xl font-bold tracking-[-0.02em] text-slate-950 sm:text-3xl">{formatLocation(result)}</h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-[#fff5d8] px-4 py-3 text-[#694d00]">
          <CloudSun size={28} strokeWidth={1.7} aria-hidden="true" />
          <div>
            <span className="block text-3xl font-bold leading-none">{current.temperature}{units.temperature}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">now</span>
          </div>
        </div>
      </div>
      <p className="mt-5 text-lg font-semibold text-slate-800">{current.condition}</p>
      <dl className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-3">
        <WeatherMetric icon={<Thermometer size={20} aria-hidden="true" />} label="Feels like" value={`${current.apparentTemperature}${units.apparentTemperature}`} />
        <WeatherMetric icon={<Droplets size={20} aria-hidden="true" />} label="Relative humidity" value={`${current.relativeHumidity}${units.relativeHumidity}`} />
        <WeatherMetric icon={<Wind size={20} aria-hidden="true" />} label="Wind speed" value={`${current.windSpeed} ${units.windSpeed}`} />
      </dl>
      <div className="mt-6"><SourceAttribution source={result.source} /></div>
    </section>
  )
}

type WeatherMetricProps = {
  icon: ReactNode
  label: string
  value: string
}

function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return (
    <div className="rounded-xl bg-[#f3f7f7] p-4">
      <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">{icon}{label}</dt>
      <dd className="mt-2 text-xl font-bold text-slate-950">{value}</dd>
    </div>
  )
}
