export type ApiErrorCode = 'INVALID_LOCATION_QUERY' | 'LOCATION_SERVICE_UNAVAILABLE' | 'INVALID_LOCATION' | 'WEATHER_SERVICE_UNAVAILABLE' | 'INTERNAL_ERROR';

export type ApiError = {
  code: ApiErrorCode;
  message?: string;
};

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_LOCATION_QUERY: 'Enter at least two characters to search for a location.',
  LOCATION_SERVICE_UNAVAILABLE: 'We could not search locations right now. Try again.',
  INVALID_LOCATION: 'Select a valid location.',
  WEATHER_SERVICE_UNAVAILABLE: 'We could not check the weather right now. Try again shortly.',
  INTERNAL_ERROR: 'An unexpected error occurred. Try again.',
};

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(API_ERROR_MESSAGES, value);
}
