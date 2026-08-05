export type WeatherLocation = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
};

export type WeatherResult = {
  location: WeatherLocation;
  current: CurrentWeather;
  observedAt: string;
};
