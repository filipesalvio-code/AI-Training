import { Weather } from '../types/weather';

export type WeatherTheme = 'clear-hot' | 'clear-cool' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'night';

export function getWeatherTheme(weather: Weather | null): WeatherTheme {
  if (!weather) return 'night';

  const { weatherCode, temperatureCelsius, isDay } = weather.current;
  if (!isDay) return 'night';
  if (weatherCode >= 95) return 'storm';
  if (weatherCode >= 71 && weatherCode <= 86) return 'snow';
  if (weatherCode >= 51 && weatherCode <= 67) return 'rain';
  if (weatherCode >= 1 && weatherCode <= 3) return 'cloudy';

  return temperatureCelsius >= 25 ? 'clear-hot' : 'clear-cool';
}
