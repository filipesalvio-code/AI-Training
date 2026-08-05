import { useEffect, useState } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { WeatherSearch } from './components/WeatherSearch';
import { useWeather } from './hooks/useWeather';
import { checkApiHealth } from './services/weather';

function App() {
  const { weather, loading, error, search } = useWeather();
  const [apiOnline, setApiOnline] = useState(true);
  useEffect(() => { const check = async () => { try { setApiOnline(await checkApiHealth()); } catch { setApiOnline(false); } }; void check(); const interval = window.setInterval(() => void check(), 5000); return () => window.clearInterval(interval); }, []);
  return <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900"><div className="mx-auto max-w-2xl"><header className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Clima agora</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Como está o tempo?</h1><p className="mt-3 text-slate-600">Pesquise uma cidade e veja as condições atuais.</p></header><WeatherSearch loading={loading} onSearch={search} />{error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}{weather && <div className="mt-6"><WeatherCard weather={weather} /></div>}<div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500" role="status" aria-live="polite"><span className={`h-2.5 w-2.5 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />{apiOnline ? 'API online' : 'API indisponível'}</div></div></main>;
}

export default App;
