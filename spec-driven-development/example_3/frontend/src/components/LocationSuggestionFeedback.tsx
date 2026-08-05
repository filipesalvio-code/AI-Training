import { useTranslation } from '../hooks/useTranslation';
import type { ApiErrorCode } from '../types/api-error';
import type { TranslationKey } from '../types/translation-key';
import type { LocationSearchState } from '../types/location-search-state';

type LocationSuggestionFeedbackProps = { state: LocationSearchState };

export function LocationSuggestionFeedback({ state }: LocationSuggestionFeedbackProps) {
  const { t } = useTranslation();
  if (state.status === 'loading') return <p id="location-feedback" className="mt-2 text-sm text-slate-300" role="status" aria-live="polite" aria-busy="true">{t('feedback.locationLoading')}</p>;
  if (state.status === 'success' && state.suggestions.length === 0) return <p id="location-feedback" className="mt-2 text-sm text-slate-300" role="status" aria-live="polite">{t('feedback.locationEmpty')}</p>;
  if (state.status === 'error') return <p id="location-feedback" className="mt-2 text-sm text-rose-200" role="alert">{t(errorKey(state.error.code))}</p>;
  return null;
}

function errorKey(code: ApiErrorCode): TranslationKey {
  if (code === 'INVALID_LOCATION_QUERY') return 'error.INVALID_LOCATION_QUERY';
  if (code === 'INVALID_LOCATION') return 'error.INVALID_LOCATION';
  if (code === 'INTERNAL_ERROR') return 'error.INTERNAL_ERROR';
  if (code === 'WEATHER_SERVICE_UNAVAILABLE') return 'error.WEATHER_SERVICE_UNAVAILABLE';
  return 'error.LOCATION_SERVICE_UNAVAILABLE';
}
