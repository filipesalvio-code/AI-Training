import type { ApiError } from '../types/api-error';
import type { WeatherSearchState } from '../types/weather-search-state';

type WeatherFeedbackProps = { state: WeatherSearchState };

export function WeatherFeedback({ state }: WeatherFeedbackProps) {
  if (state.status === 'loading') return <p className="border-l-2 border-amber-400 py-3 pl-4 text-slate-200" role="status" aria-live="polite" aria-busy="true">Fetching current conditions…</p>;
  if (state.status === 'error' && state.error.code !== 'INVALID_CITY') return <ErrorMessage error={state.error} />;
  return null;
}

function ErrorMessage({ error }: { error: ApiError }) {
  return <div className="border-l-2 border-rose-400 py-3 pl-4 text-rose-100" role="alert"><p className="font-medium">{error.message}</p><p className="mt-1 text-sm text-rose-200">Check the city name and try again.</p></div>;
}
