import type { ApiError } from './api-error';
import type { LocationSuggestion } from './location-suggestion';

export type LocationSearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; suggestions: LocationSuggestion[] }
  | { status: 'error'; query: string; error: ApiError };
