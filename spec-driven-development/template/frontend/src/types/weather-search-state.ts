import type { ApiErrorDetails } from './api-error'
import type { WeatherResponse } from './weather-response'

export type WeatherSearchState =
  | { status: 'idle'; result: null; error: null }
  | { status: 'loading'; result: null; error: null }
  | { status: 'success'; result: WeatherResponse; error: null }
  | { status: 'error'; result: null; error: ApiErrorDetails }

export type WeatherSearchResult = {
  state: WeatherSearchState
  search: (city: string) => Promise<void>
}
