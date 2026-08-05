export type AppErrorCode =
  | 'INVALID_LOCATION_QUERY'
  | 'LOCATION_SERVICE_UNAVAILABLE'
  | 'INVALID_LOCATION'
  | 'WEATHER_SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

const PUBLIC_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_LOCATION_QUERY: 'Informe ao menos dois caracteres para buscar uma localidade.',
  LOCATION_SERVICE_UNAVAILABLE: 'Não foi possível buscar localidades agora. Tente novamente.',
  INVALID_LOCATION: 'Selecione uma localidade válida.',
  WEATHER_SERVICE_UNAVAILABLE: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;

  constructor(code: AppErrorCode, status: number, cause?: unknown) {
    super(PUBLIC_MESSAGES[code], { cause });
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export function publicMessage(code: AppErrorCode): string {
  return PUBLIC_MESSAGES[code];
}
