import { useState } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { WeatherSearch } from './components/WeatherSearch';
import { useWeather } from './hooks/useWeather';
import { getWeatherTheme } from './lib/weather-theme';
import { TemperatureUnit } from './types/temperatureUnit';

function App() {
  const { weather, isLoading, error, searchWeather } = useWeather();
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const weatherTheme = getWeatherTheme(weather);
  const statusMessage = isLoading
    ? 'Tuning the city sensors…'
    : weather
      ? `Atmospheric reading updated for ${weather.location.name}.`
      : 'Search for a city to start the atmospheric reading.';

  function toggleTemperatureUnit(): void {
    setTemperatureUnit((unit) => unit === 'celsius' ? 'fahrenheit' : 'celsius');
  }

  return (
    <main className={`weather-scene scene-${weatherTheme}`}>
      <div className="weather-orb weather-orb-one" aria-hidden="true" />
      <div className="weather-orb weather-orb-two" aria-hidden="true" />
      <div className="radar-lines" aria-hidden="true" />
      <div className="weather-shell">
        <header className="weather-header">
          <div className="brand-lockup" aria-label="Atmosphere, weather forecast"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>atmosphere</span></div>
          <p className="weather-intro">The weather changes. Your reading keeps up.</p>
          <h1>The city sky,<br /><em>in real time.</em></h1>
        </header>
        <WeatherSearch isLoading={isLoading} onSubmit={searchWeather} />
        <p className="signal-status" aria-live="polite"><span aria-hidden="true" />{statusMessage}</p>
        {error && <p role="alert" className="weather-error">{error}</p>}
        {weather && <WeatherCard weather={weather} temperatureUnit={temperatureUnit} onTemperatureUnitToggle={toggleTemperatureUnit} />}
      </div>
    </main>
  );
}

export default App;
