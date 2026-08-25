import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react'
import { Cloud, Droplets, LoaderCircle, MapPin, RefreshCw, Search, Sunrise, Thermometer, Wind } from 'lucide-react'

type ApiStatus = 'checking' | 'online' | 'offline'

type WeatherData = {
  location: { name: string; region?: string; country?: string }
  timezone: string
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    is_day: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const weatherDescription = (code: number) => {
  if (code === 0) return 'Clear sky'
  if ([1, 2].includes(code)) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Variable conditions'
}

const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat('en-US', {
  hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
}).format(new Date(value))

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/health')
        if (response.ok) {
          setApiStatus('online')
        } else {
          setApiStatus('offline')
        }
      } catch {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchWeather = useCallback(async (event?: FormEvent) => {
    event?.preventDefault()
    const searchedCity = city.trim()
    if (!searchedCity) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/weather?city=${encodeURIComponent(searchedCity)}`)
      const data = await response.json() as WeatherData & { error?: string }
      if (!response.ok) throw new Error(data.error || 'Could not load weather.')
      setWeather(data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load weather.')
    } finally {
      setLoading(false)
    }
  }, [city])

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online':
        return 'status-online'
      case 'offline':
        return 'status-offline'
      case 'checking':
        return 'status-checking'
      default:
        return 'status-offline'
    }
  }

  return (
    <main className="weather-shell">
      <div className="weather-glow weather-glow-one" />
      <div className="weather-glow weather-glow-two" />
      <section className="weather-container">
        <header className="weather-header">
          <div>
            <p className="eyebrow"><Cloud size={16} /> CLIMA AGORA</p>
            <h1>How's the weather?</h1>
            <p className="subtitle">Check current conditions for any city.</p>
          </div>
          <div className="api-indicator">
            <span className={`status-dot ${getStatusColor()}`} />
            API {apiStatus === 'online' ? 'conectada' : apiStatus === 'checking' ? 'verificando' : 'offline'}
          </div>
        </header>

        <form className="search-form" onSubmit={fetchWeather}>
          <MapPin size={19} className="search-icon" />
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Enter a city..." aria-label="City" />
          <button type="submit" disabled={loading || !city.trim()}>{loading ? <LoaderCircle className="spin" size={18} /> : <Search size={18} />} Search</button>
        </form>

        {error && <div className="error-message" role="alert">{error}<button type="button" onClick={() => void fetchWeather()}><RefreshCw size={15} /> Tentar novamente</button></div>}

        {weather && !error && <div className="weather-grid">
          <article className="current-card">
            <div className="location-line"><MapPin size={17} /><span>{weather.location.name}{weather.location.region ? `, ${weather.location.region}` : ''}</span></div>
            <div className="current-main"><div className="weather-symbol"><Sunrise size={54} /></div><div><div className="temperature">{Math.round(weather.current.temperature_2m)}<sup>°C</sup></div><p>{weatherDescription(weather.current.weather_code)}</p></div></div>
            <div className="feels-like">Feels like {Math.round(weather.current.apparent_temperature)}°C</div>
            <div className="updated">Updated at {formatUpdatedAt(weather.current.time)}</div>
          </article>
          <div className="details-grid">
            <Detail icon={<Droplets />} label="Humidity" value={`${weather.current.relative_humidity_2m}%`} />
            <Detail icon={<Wind />} label="Wind" value={`${Math.round(weather.current.wind_speed_10m)} km/h`} />
            <Detail icon={<Cloud />} label="Rain" value={`${weather.current.precipitation} mm`} />
            <Detail icon={<Thermometer />} label="Temperatura" value={`${Math.round(weather.current.temperature_2m)}°C`} />
          </div>
        </div>}

        {!weather && !loading && !error && <div className="empty-state"><Cloud size={42} /><p>Enter a city to get started.</p></div>}
        {loading && <div className="loading-state"><LoaderCircle className="spin" size={30} /><p>Fetching current conditions...</p></div>}
        <footer>Weather data provided by Open-Meteo</footer>
      </section>
    </main>
  )
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="detail-card"><span className="detail-icon">{icon}</span><div><span className="detail-label">{label}</span><strong>{value}</strong></div></div>
}

export default App
