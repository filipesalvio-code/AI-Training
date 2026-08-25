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
    <main className={`weather-workbench scene-${weatherTheme}`}>
      <div className="workbench-shadow" aria-hidden="true" />
      <div className="weather-shell">
        <header className="weather-header">
          <div className="brand-lockup" aria-label="Atmosphere, weather forecast"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>atmosphere</span></div>
          <h1>Weather, precise enough to decide.</h1>
          <p className="weather-description">Check current conditions for any city in an operational reading.</p>
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
