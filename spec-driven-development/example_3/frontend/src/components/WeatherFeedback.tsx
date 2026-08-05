import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKey } from '../types/translation-key';
import type { ApiError, ApiErrorCode } from '../types/api-error';
import type { WeatherSearchState } from '../types/weather-search-state';

type WeatherFeedbackProps = { state: WeatherSearchState };

export function WeatherFeedback({ state }: WeatherFeedbackProps) {
  const { t } = useTranslation();
  if (state.status === 'loading') return <p className="border-l-2 border-amber-400 py-3 pl-4 text-slate-200" role="status" aria-live="polite" aria-busy="true">{t('feedback.loading')}</p>;
  if (state.status === 'error') return <ErrorMessage error={state.error} />;
  return null;
}

function ErrorMessage({ error }: { error: ApiError }) {
  const { t } = useTranslation();
  return <div className="border-l-2 border-rose-400 py-3 pl-4 text-rose-100" role="alert"><p className="font-medium">{error.message ?? t(errorKey(error.code))}</p><p className="mt-1 text-sm text-rose-200">{t('feedback.retryHint')}</p></div>;
}

function errorKey(code: ApiErrorCode): TranslationKey {
  if (code === 'INVALID_LOCATION') return 'error.INVALID_LOCATION';
  if (code === 'LOCATION_SERVICE_UNAVAILABLE') return 'error.LOCATION_SERVICE_UNAVAILABLE';
  if (code === 'INVALID_LOCATION_QUERY') return 'error.INVALID_LOCATION_QUERY';
  if (code === 'INTERNAL_ERROR') return 'error.INTERNAL_ERROR';
  return 'error.WEATHER_SERVICE_UNAVAILABLE';
}
