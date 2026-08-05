export type WeatherLocation = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  temperatureCelsius: number;
  apparentTemperatureCelsius: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  weatherCode: number;
  isDay: boolean;
  observedAt: string;
};

export type Weather = {
  location: WeatherLocation;
  current: CurrentWeather;
};
