export type Weather = {
  location: { name: string; country: string; timezone: string };
  current: { temperature: number; apparentTemperature: number; humidity: number; windSpeed: number; precipitation: number; weatherCode: number; isDay: boolean };
  observedAt: string;
};
