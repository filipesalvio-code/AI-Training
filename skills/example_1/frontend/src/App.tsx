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
    ? 'Sintonizando os sensores da cidade…'
    : weather
      ? `Leitura atmosférica atualizada para ${weather.location.name}.`
      : 'Pesquise uma cidade para iniciar a leitura atmosférica.';

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
          <div className="brand-lockup" aria-label="Atmosfera, previsão do tempo"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>atmosfera</span></div>
          <p className="weather-intro">O clima muda. A sua leitura acompanha.</p>
          <h1>O céu da cidade,<br /><em>em tempo real.</em></h1>
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
