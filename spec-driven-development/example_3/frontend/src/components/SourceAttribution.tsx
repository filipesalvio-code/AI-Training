import type { WeatherResponse } from '../types/weather-response';
import { useTranslation } from '../hooks/useTranslation';

type SourceAttributionProps = { source: WeatherResponse['source'] };

export function SourceAttribution({ source }: SourceAttributionProps) {
  const { t } = useTranslation();
  return <p className="text-sm leading-6 text-slate-400">{t('source.dataBy')} <a className="text-slate-200 underline decoration-amber-400 underline-offset-4 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300" href={source.url} target="_blank" rel="noreferrer">{source.name}</a>{t('source.licensedUnder')} <a className="text-slate-200 underline decoration-amber-400 underline-offset-4 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300" href={source.licenseUrl} target="_blank" rel="noreferrer">{source.license}</a>.</p>;
}
