export interface WeatherResponse {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface GeocodingApiResponse {
  results?: GeocodingResult[];
}

interface ForecastApiResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
}

export class CityNotFoundError extends Error {}

export async function getWeatherByCity(city: string): Promise<WeatherResponse> {
  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geocodingUrl.searchParams.set('name', city);
  geocodingUrl.searchParams.set('count', '1');
  geocodingUrl.searchParams.set('language', 'pt');

  const geocodingRes = await fetch(geocodingUrl);
  if (!geocodingRes.ok) {
    throw new Error(`Geocoding API error: ${geocodingRes.status}`);
  }
  const geocodingData = (await geocodingRes.json()) as GeocodingApiResponse;
  const location = geocodingData.results?.[0];
  if (!location) {
    throw new CityNotFoundError(`City not found: ${city}`);
  }

  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.searchParams.set('latitude', String(location.latitude));
  forecastUrl.searchParams.set('longitude', String(location.longitude));
  forecastUrl.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
  );

  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) {
    throw new Error(`Weather API error: ${forecastRes.status}`);
  }
  const forecastData = (await forecastRes.json()) as ForecastApiResponse;
  const current = forecastData.current;

  return {
    city: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    time: current.time,
  };
}

export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherResponse> {
  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.searchParams.set('latitude', String(latitude));
  forecastUrl.searchParams.set('longitude', String(longitude));
  forecastUrl.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
  );

  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) {
    throw new Error(`Weather API error: ${forecastRes.status}`);
  }
  const forecastData = (await forecastRes.json()) as ForecastApiResponse;
  const current = forecastData.current;

  return {
    city: 'Localização atual',
    country: '',
    latitude,
    longitude,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    time: current.time,
  };
}
