export type AppErrorCode =
  | 'INVALID_CITY'
  | 'CITY_NOT_FOUND'
  | 'WEATHER_SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

const PUBLIC_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_CITY: 'Informe uma cidade com pelo menos dois caracteres.',
  CITY_NOT_FOUND: 'Cidade não encontrada. Verifique o nome e tente novamente.',
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
