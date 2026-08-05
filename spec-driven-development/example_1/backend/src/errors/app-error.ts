export type AppErrorCode =
  | 'INVALID_CITY'
  | 'CITY_NOT_FOUND'
  | 'WEATHER_SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export type AppErrorDetails = {
  code: AppErrorCode
  statusCode: number
  message: string
  cause?: unknown
}

export const ERROR_MESSAGES = {
  invalidCity: 'Informe uma cidade com pelo menos dois caracteres.',
  cityNotFound: 'Cidade não encontrada. Verifique o nome e tente novamente.',
  serviceUnavailable: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
} as const

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly statusCode: number

  constructor(details: AppErrorDetails) {
    super(details.message, { cause: details.cause })
    this.name = 'AppError'
    this.code = details.code
    this.statusCode = details.statusCode
  }
}

export function cityNotFoundError(): AppError {
  return new AppError({ code: 'CITY_NOT_FOUND', statusCode: 404, message: ERROR_MESSAGES.cityNotFound })
}

export function weatherUnavailableError(cause?: unknown): AppError {
  return new AppError({
    code: 'WEATHER_SERVICE_UNAVAILABLE',
    statusCode: 503,
    message: ERROR_MESSAGES.serviceUnavailable,
    cause,
  })
}
