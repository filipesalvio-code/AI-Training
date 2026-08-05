import { CloudSun, Droplets, Eye, Wind } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Weather } from '../types/weather';

type WeatherCardProps = { weather: Weather };

function describeWeather(code: number): string {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Neblina';
  if (code <= 67 || code >= 80) return 'Chuva';
  if (code <= 77) return 'Neve';
  return 'Trovoada';
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const { location, current } = weather;
  return <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl" aria-label="Clima atual">
    <div className="flex items-start justify-between"><div><p className="text-sm text-slate-300">Agora em</p><h2 className="text-2xl font-semibold">{location.name}</h2><p className="text-sm text-slate-300">{location.country}</p></div><CloudSun className="h-10 w-10 text-amber-300" aria-hidden="true" /></div>
    <div className="my-8 flex items-center gap-4"><span className="text-6xl font-bold">{Math.round(current.temperature)}°</span><div><p className="text-lg">{describeWeather(current.weatherCode)}</p><p className="text-sm text-slate-300">Sensação de {Math.round(current.apparentTemperature)}°</p></div></div>
    <div className="grid grid-cols-3 gap-3 text-sm"><Metric icon={<Droplets />} label="Umidade" value={`${current.humidity}%`} /><Metric icon={<Wind />} label="Vento" value={`${Math.round(current.windSpeed)} km/h`} /><Metric icon={<Eye />} label="Chuva" value={`${current.precipitation} mm`} /></div>
  </section>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-white/10 p-3"><div className="mb-2 flex items-center gap-2 text-slate-300">{icon}<span>{label}</span></div><strong>{value}</strong></div>; }
