export type LocationSuggestion = {
  city: string;
  administrativeArea: string | null;
  country: string;
  countryCode?: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};
