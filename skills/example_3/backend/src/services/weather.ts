import { fetchCurrentWeather, findLocation } from '../data/open-meteo';
import { Weather } from '../types/weather';

const MINIMUM_CITY_LENGTH = 2;

export async function getWeather(city: string): Promise<Weather> {
  const normalizedCity = city.trim();
  if (normalizedCity.length < MINIMUM_CITY_LENGTH) throw new Error('Informe uma cidade válida');
  const location = await findLocation(normalizedCity);
  if (!location) throw new Error(`Não encontramos a cidade "${normalizedCity}"`);
  return { location, current: await fetchCurrentWeather(location) };
}
