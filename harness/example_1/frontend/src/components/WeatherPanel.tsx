import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  describeWeatherCode,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  WeatherApiError,
  type WeatherData,
} from '@/lib/weather'

export function WeatherPanel() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedLocation, setSuggestedLocation] = useState<WeatherData | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchWeatherByCoordinates(
            position.coords.latitude,
            position.coords.longitude
          )
          setSuggestedLocation(data)
        } catch {
          // ignore silently, geolocation suggestion is optional
        }
      },
      () => {
        // user denied or unavailable, nothing to do
      }
    )
  }, [])

  const search = async (searchCity: string) => {
    if (!searchCity.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeatherByCity(searchCity)
      setWeather(data)
    } catch (err) {
      setWeather(null)
      setError(err instanceof WeatherApiError ? err.message : 'Could not get weather')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    search(city)
  }

  const useSuggestedLocation = () => {
    if (!suggestedLocation) return
    setCity('')
    setError(null)
    setWeather(suggestedLocation)
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold text-card-foreground">Weather Panel</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter a city..."
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {suggestedLocation && (
        <button
          onClick={useSuggestedLocation}
          className="mt-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Use my current location ({Math.round(suggestedLocation.temperature)}°C)
        </button>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {weather && (
        <div className="mt-6 space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-medium text-card-foreground">
              {weather.city}
              {weather.country ? `, ${weather.country}` : ''}
            </h3>
            <span className="text-4xl font-bold text-card-foreground">
              {Math.round(weather.temperature)}°C
            </span>
          </div>
          <p className="text-muted-foreground">{describeWeatherCode(weather.weatherCode)}</p>
          <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
            <div>
              <p className="text-muted-foreground">Feels like</p>
              <p className="font-medium text-card-foreground">
                {Math.round(weather.apparentTemperature)}°C
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Humidity</p>
              <p className="font-medium text-card-foreground">{weather.humidity}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Wind</p>
              <p className="font-medium text-card-foreground">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
