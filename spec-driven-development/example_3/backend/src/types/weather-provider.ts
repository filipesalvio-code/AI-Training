import type { Coordinates } from './coordinates';
import type { ProviderConditions } from './provider-conditions';
import type { ResolvedLocation } from './resolved-location';

export interface WeatherProvider {
  searchLocations(query: string, signal: AbortSignal): Promise<ResolvedLocation[]>;
  getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions>;
}
