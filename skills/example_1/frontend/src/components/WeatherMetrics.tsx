import { ReactNode } from 'react';
import { Droplets, ThermometerSun, Wind } from 'lucide-react';
import { formatTemperature } from '../lib/temperature';
import { TemperatureUnit } from '../types/temperatureUnit';
import { Weather } from '../types/weather';

type WeatherMetricsProps = { current: Weather['current']; unit: TemperatureUnit };

export function WeatherMetrics({ current, unit }: WeatherMetricsProps) {
  return <div className="weather-metrics">
    <Metric icon={<ThermometerSun size={19} />} label="Feels like" value={formatTemperature(current.apparentTemperatureCelsius, unit)} />
    <Metric icon={<Droplets size={19} />} label="Humidity" value={`${current.relativeHumidity}%`} />
    <Metric icon={<Wind size={19} />} label="Wind" value={`${Math.round(current.windSpeedKmh)} km/h`} />
  </div>;
}

type MetricProps = { icon: ReactNode; label: string; value: string };

function Metric({ icon, label, value }: MetricProps) {
  return <div className="weather-metric"><span className="metric-icon" aria-hidden="true">{icon}</span><p>{label}</p><strong>{value}</strong></div>;
}
