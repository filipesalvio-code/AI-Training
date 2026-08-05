export type Weather = {
  location: { name: string; country: string };
  current: {
    temperatureCelsius: number;
    apparentTemperatureCelsius: number;
    relativeHumidity: number;
    windSpeedKmh: number;
    weatherCode: number;
    isDay: boolean;
    observedAt: string;
  };
};
