export type ApiErrorCode = 'INVALID_CITY' | 'CITY_NOT_FOUND' | 'WEATHER_SERVICE_UNAVAILABLE' | 'INTERNAL_ERROR';

export type ApiError = {
  code: ApiErrorCode;
  message: string;
};
