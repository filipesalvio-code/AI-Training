import type { WeatherResponse } from '../types/weather-response'

type SourceAttributionProps = {
  source: WeatherResponse['source']
}

export function SourceAttribution({ source }: SourceAttributionProps) {
  return (
    <p className="border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
      Data by{' '}
      <a className="font-semibold text-[#14596a] underline decoration-[#f4c95d] decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#f4c95d]" href={source.url} target="_blank" rel="noreferrer">
        {source.name}
      </a>{' '}
      under the{' '}
      <a className="font-semibold text-[#14596a] underline decoration-[#f4c95d] decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#f4c95d]" href={source.licenseUrl} target="_blank" rel="noreferrer">
        {source.license}
      </a>.
    </p>
  )
}
