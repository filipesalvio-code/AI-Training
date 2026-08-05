import type { Coordinates } from './coordinates';

export type ResolvedLocation = {
  city: string;
  administrativeArea: string | null;
  country: string;
  countryCode: string | null;
  coordinates: Coordinates;
};
