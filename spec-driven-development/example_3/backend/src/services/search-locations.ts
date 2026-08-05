import { performance } from 'node:perf_hooks';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import { MAX_LOCATION_SUGGESTIONS } from '../types/location-suggestion';
import type { LocationSuggestion } from '../types/location-suggestion';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';
import { normalizeLocationQuery } from './normalize-location-query';

export class SearchLocations {
  constructor(private readonly provider: WeatherProvider, private readonly timeoutMs: number) {}

  async execute(query: string | undefined): Promise<LocationSuggestionsResponse> {
    const normalizedQuery = normalizeLocationQuery(query);
    const controller = new AbortController();
    const startedAt = performance.now();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const locations = await this.provider.searchLocations(normalizedQuery, controller.signal);
      if (controller.signal.aborted) throw new AppError('LOCATION_SERVICE_UNAVAILABLE', 503);
      const response = { suggestions: locations.slice(0, MAX_LOCATION_SUGGESTIONS).map(toSuggestion) };
      logger.info('location_suggestions_completed', {
        status: 200,
        result: response.suggestions.length ? 'success' : 'empty',
        resultCount: response.suggestions.length,
        durationMs: elapsed(startedAt),
      });
      return response;
    } catch (error: unknown) {
      const normalizedError = error instanceof AppError
        ? error
        : new AppError('LOCATION_SERVICE_UNAVAILABLE', 503, error);
      logger.error('location_suggestions_failed', {
        status: normalizedError.status,
        cause: normalizedError.code,
        dependency: 'open-meteo-geocoding',
        durationMs: elapsed(startedAt),
      });
      throw normalizedError;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function toSuggestion(location: ResolvedLocation): LocationSuggestion {
  return {
    city: location.city,
    administrativeArea: location.administrativeArea,
    country: location.country,
    ...(location.countryCode ? { countryCode: location.countryCode } : {}),
    coordinates: location.coordinates,
  };
}

function elapsed(startedAt: number): number {
  return Math.round(performance.now() - startedAt);
}
