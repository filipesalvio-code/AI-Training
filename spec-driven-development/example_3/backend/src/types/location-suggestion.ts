import type { Coordinates } from './coordinates';

export const MAX_LOCATION_SUGGESTIONS = 5;

export type LocationSuggestion = {
  city: string;
  administrativeArea: string | null;
  country: string;
  countryCode?: string | null;
  coordinates: Coordinates;
};
