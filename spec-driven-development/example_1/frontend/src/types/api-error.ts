export type ApiErrorCode =
  | 'INVALID_CITY'
  | 'CITY_NOT_FOUND'
  | 'WEATHER_SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export type ApiErrorDetails = {
  code: ApiErrorCode
  message: string
}

export type ApiError = {
  error: ApiErrorDetails
}

export class WeatherApiError extends Error {
  readonly code: ApiErrorCode

  constructor(details: ApiErrorDetails) {
    super(details.message)
    this.name = 'WeatherApiError'
    this.code = details.code
  }
}
