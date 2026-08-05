import { Weather } from '../types/weather';

type WeatherCardProps = { weather: Weather };

function describeWeather(code: number): string {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code >= 51 && code <= 67) return 'Chuva';
  if (code >= 71 && code <= 86) return 'Neve';
  if (code >= 95) return 'Trovoada';
  return 'Condições variáveis';
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const { current, location } = weather;
  return (
    <section aria-label={`Clima em ${location.name}`} className="mt-8 rounded-3xl bg-white p-6 text-slate-900 shadow-xl sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-slate-500">Agora em</p><h2 className="text-2xl font-bold">{location.name}</h2><p className="text-slate-500">{location.country}</p></div>
        <span className="text-5xl" aria-hidden="true">{current.isDay ? '☀️' : '🌙'}</span>
      </div>
      <div className="mt-8 flex items-end gap-3"><strong className="text-6xl font-bold tracking-tight">{Math.round(current.temperatureCelsius)}°</strong><span className="pb-2 text-lg text-slate-500">{describeWeather(current.weatherCode)}</span></div>
      <div className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3"><Metric label="Sensação" value={`${Math.round(current.apparentTemperatureCelsius)}°C`} /><Metric label="Umidade" value={`${current.relativeHumidity}%`} /><Metric label="Vento" value={`${Math.round(current.windSpeedKmh)} km/h`} /></div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-100 p-4"><p className="text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}
