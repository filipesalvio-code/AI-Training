import { FormEvent, useState } from 'react'
import { Cloud, CloudRain, CloudSun, Droplets, LoaderCircle, Search, Sun, Wind } from 'lucide-react'

type Weather = {
  location: { name: string; region?: string; country: string }
  current: {
    time: string; temperature_2m: number; apparent_temperature: number
    relative_humidity_2m: number; weather_code: number; wind_speed_10m: number; description: string
  }
}

const API_URL = 'http://localhost:3001/api/weather'

function WeatherIcon({ code }: { code: number }) {
  if (code >= 51) return <CloudRain aria-hidden="true" />
  if (code >= 1) return <CloudSun aria-hidden="true" />
  return <Sun aria-hidden="true" />
}

function App() {
  const [city, setCity] = useState('São Paulo')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const searchWeather = async (event?: FormEvent, cityToSearch = city) => {
    event?.preventDefault()
    if (!cityToSearch.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}?city=${encodeURIComponent(cityToSearch.trim())}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar o clima.')
      setWeather(data)
    } catch (err) {
      setWeather(null)
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <section className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-sky-400 p-3 text-slate-950"><Cloud size={28} /></div>
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Previsão agora</p><h1 className="text-3xl font-bold">Painel de clima</h1></div>
        </div>

        <form onSubmit={searchWeather} className="mb-6 flex gap-2">
          <label className="sr-only" htmlFor="city">Cidade</label>
          <input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Digite uma cidade" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none transition focus:border-sky-400" />
          <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60">
            {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : <Search size={20} />} Buscar
          </button>
        </form>

        {error && <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">{error}</p>}

        {!weather && !error && !isLoading && <div className="rounded-3xl border border-dashed border-slate-700 p-12 text-center text-slate-400">Busque uma cidade para ver o clima atual.</div>}

        {weather && <article className="overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 to-sky-950 shadow-2xl shadow-sky-950/40">
          <div className="p-7 sm:p-9">
            <p className="text-lg font-semibold">{weather.location.name}{weather.location.region ? `, ${weather.location.region}` : ''}</p>
            <p className="text-sm text-slate-400">{weather.location.country} · Atualizado às {new Date(weather.current.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <div className="mt-8 flex items-center gap-5"><div className="text-sky-300"><WeatherIcon code={weather.current.weather_code} /></div><span className="text-7xl font-bold tracking-tighter">{Math.round(weather.current.temperature_2m)}°</span><span className="self-end pb-2 text-lg text-slate-300">{weather.current.description}</span></div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-700 bg-slate-950/30">
            <Metric icon={<Sun />} label="Sensação" value={`${Math.round(weather.current.apparent_temperature)}°`} />
            <Metric icon={<Droplets />} label="Umidade" value={`${weather.current.relative_humidity_2m}%`} />
            <Metric icon={<Wind />} label="Vento" value={`${Math.round(weather.current.wind_speed_10m)} km/h`} />
          </div>
        </article>}
      </section>
    </main>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="p-5 text-center"><div className="mx-auto mb-2 w-fit text-sky-300">{icon}</div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold">{value}</p></div>
}

export default App
