import type { ApiError } from './api-error';
import type { WeatherResponse } from './weather-response';

export type WeatherSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WeatherResponse }
  | { status: 'error'; error: ApiError };
