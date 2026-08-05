import { CloudLightning, CloudRain, CloudSnow, CloudSun, MoonStar, Sun } from 'lucide-react';
import { formatTemperature } from '../lib/temperature';
import { TemperatureUnit } from '../types/temperatureUnit';
import { Weather } from '../types/weather';
import { TemperatureUnitToggle } from './TemperatureUnitToggle';
import { WeatherMetrics } from './WeatherMetrics';

type WeatherCardProps = { weather: Weather; temperatureUnit: TemperatureUnit; onTemperatureUnitToggle: () => void };

function describeWeather(code: number): string {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code >= 51 && code <= 67) return 'Chuva';
  if (code >= 71 && code <= 86) return 'Neve';
  if (code >= 95) return 'Trovoada';
  return 'Condições variáveis';
}

function WeatherSymbol({ weatherCode, isDay }: Pick<Weather['current'], 'weatherCode' | 'isDay'>) {
  const Icon = weatherCode >= 95 ? CloudLightning : weatherCode >= 71 && weatherCode <= 86 ? CloudSnow : weatherCode >= 51 && weatherCode <= 67 ? CloudRain : weatherCode <= 3 && isDay ? (weatherCode === 0 ? Sun : CloudSun) : MoonStar;
  return <Icon size={62} strokeWidth={1.45} aria-hidden="true" />;
}

export function WeatherCard({ weather, temperatureUnit, onTemperatureUnitToggle }: WeatherCardProps) {
  const { current, location } = weather;
  return <section aria-label={`Clima em ${location.name}`} className="weather-card">
    <div className="weather-card-top"><div><p className="location-label">Leitura local</p><h2>{location.name}</h2><p className="location-country">{location.country}</p></div><TemperatureUnitToggle unit={temperatureUnit} onToggle={onTemperatureUnitToggle} /></div>
    <div className="weather-reading"><div><p className="condition-name">{describeWeather(current.weatherCode)}</p><strong>{formatTemperature(current.temperatureCelsius, temperatureUnit)}</strong></div><div className="condition-symbol"><WeatherSymbol weatherCode={current.weatherCode} isDay={current.isDay} /></div></div>
    <WeatherMetrics current={current} unit={temperatureUnit} />
  </section>;
}
