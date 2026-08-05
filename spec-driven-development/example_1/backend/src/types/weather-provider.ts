import type { Coordinates } from './coordinates'
import type { ProviderConditions } from './provider-conditions'
import type { ResolvedLocation } from './resolved-location'

export interface WeatherProvider {
  searchFirstLocation(city: string, signal: AbortSignal): Promise<ResolvedLocation | null>
  getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions>
}
