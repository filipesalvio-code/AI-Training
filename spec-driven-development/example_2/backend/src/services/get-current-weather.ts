import { performance } from 'node:perf_hooks';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import { normalizeCity } from './normalize-city';
import { weatherCondition } from './weather-condition';
import type { ProviderConditions } from '../types/provider-conditions';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';
import type { WeatherResponse } from '../types/weather-response';

const SOURCE = { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' } as const;

export class GetCurrentWeather {
  constructor(private readonly provider: WeatherProvider, private readonly timeoutMs: number) {}

  async execute(city: string | undefined): Promise<WeatherResponse> {
    const normalizedCity = normalizeCity(city);
    const controller = new AbortController();
    const startedAt = performance.now();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const location = await this.provider.searchFirstLocation(normalizedCity, controller.signal);
      if (!location) throw new AppError('CITY_NOT_FOUND', 404);
      if (controller.signal.aborted) throw new AppError('WEATHER_SERVICE_UNAVAILABLE', 503);
      const conditions = await this.provider.getCurrentConditions(location.coordinates, controller.signal);
      const response = buildResponse(location, conditions);
      logger.info('weather_query_completed', { result: 'success', status: 200, durationMs: elapsed(startedAt) });
      return response;
    } catch (error: unknown) {
      const normalizedError = error instanceof AppError ? error : new AppError('WEATHER_SERVICE_UNAVAILABLE', 503, error);
      logger.error('weather_provider_failed', { status: normalizedError.status, durationMs: elapsed(startedAt), cause: normalizedError.code });
      throw normalizedError;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function buildResponse(location: ResolvedLocation, conditions: ProviderConditions): WeatherResponse {
  return {
    location: { city: location.city, administrativeArea: location.administrativeArea, country: location.country },
    current: { temperature: conditions.temperature, apparentTemperature: conditions.apparentTemperature, condition: weatherCondition(conditions.weatherCode), relativeHumidity: conditions.relativeHumidity, windSpeed: conditions.windSpeed },
    units: { temperature: '°C', apparentTemperature: '°C', relativeHumidity: '%', windSpeed: 'km/h' },
    source: SOURCE,
  };
}

function elapsed(startedAt: number): number {
  return Math.round(performance.now() - startedAt);
}
