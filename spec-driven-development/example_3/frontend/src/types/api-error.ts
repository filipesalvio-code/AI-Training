export type ApiErrorCode = 'INVALID_LOCATION_QUERY' | 'LOCATION_SERVICE_UNAVAILABLE' | 'INVALID_LOCATION' | 'WEATHER_SERVICE_UNAVAILABLE' | 'INTERNAL_ERROR';

export type ApiError = {
  code: ApiErrorCode;
  message?: string;
};

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_LOCATION_QUERY: 'Informe ao menos dois caracteres para buscar uma localidade.',
  LOCATION_SERVICE_UNAVAILABLE: 'Não foi possível buscar localidades agora. Tente novamente.',
  INVALID_LOCATION: 'Selecione uma localidade válida.',
  WEATHER_SERVICE_UNAVAILABLE: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(API_ERROR_MESSAGES, value);
}
