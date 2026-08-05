import type { Coordinates } from './coordinates'

export type ResolvedLocation = {
  city: string
  administrativeArea: string | null
  country: string
  coordinates: Coordinates
}
