import type { Environment } from '../config/environment';
import { AppError } from '../errors/app-error';
import { parseForecastResponse } from './parse-forecast-response';
import { parseGeocodingResponse } from './parse-geocoding-response';
import type { Coordinates } from '../types/coordinates';
import type { ProviderConditions } from '../types/provider-conditions';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';

const CURRENT_FIELDS = 'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m';

export class OpenMeteoClient implements WeatherProvider {
  constructor(private readonly environment: Environment) {}

  async searchFirstLocation(city: string, signal: AbortSignal): Promise<ResolvedLocation | null> {
    const url = new URL(this.environment.geocodingUrl);
    url.search = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' }).toString();
    return parseGeocodingResponse(await this.fetchJson(url, signal));
  }

  async getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions> {
    const url = new URL(this.environment.forecastUrl);
    url.search = new URLSearchParams({ latitude: String(coordinates.latitude), longitude: String(coordinates.longitude), current: CURRENT_FIELDS, temperature_unit: 'celsius', wind_speed_unit: 'kmh' }).toString();
    return parseForecastResponse(await this.fetchJson(url, signal));
  }

  private async fetchJson(url: URL, signal: AbortSignal): Promise<unknown> {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json() as unknown;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503, error);
    }
  }
}
