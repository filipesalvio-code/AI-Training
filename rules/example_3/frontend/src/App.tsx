import { useWeather } from './hooks/useWeather';
import { WeatherCard } from './components/WeatherCard';
import { WeatherSearch } from './components/WeatherSearch';

function App() {
  const { weather, isLoading, error, searchWeather } = useWeather();
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">Previsão agora</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Como está o tempo?</h1><p className="mt-4 text-slate-400">Consulte as condições atuais de qualquer cidade.</p></header>
        <WeatherSearch isLoading={isLoading} onSubmit={searchWeather} />
        {error && <p role="alert" className="mt-4 rounded-2xl bg-red-950/60 px-4 py-3 text-red-200">{error}</p>}
        {weather && <WeatherCard weather={weather} />}
      </div>
    </main>
  );
}

export default App;
