export type WeatherResponse = {
  location: { city: string; administrativeArea: string | null; country: string; countryCode: string | null };
  current: { temperature: number; apparentTemperature: number; weatherCode: number; condition: string; relativeHumidity: number; windSpeed: number };
  units: { temperature: '°C'; apparentTemperature: '°C'; relativeHumidity: '%'; windSpeed: 'km/h' };
  source: { name: 'Open-Meteo'; url: string; license: 'CC BY 4.0'; licenseUrl: string };
};
