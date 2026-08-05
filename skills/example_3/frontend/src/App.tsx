import { useState } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { WeatherErrorMessage } from './components/WeatherErrorMessage';
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
    <main className={`weather-workbench scene-${weatherTheme}`}>
      <div className="workbench-shadow" aria-hidden="true" />
      <div className="weather-shell">
        <header className="weather-header">
          <div className="brand-lockup" aria-label="Atmosfera, previsão do tempo"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>atmosfera</span></div>
          <h1>Clima, com precisão suficiente para decidir.</h1>
          <p className="weather-description">Consulte as condições atuais de qualquer cidade em uma leitura operacional.</p>
        </header>
        <WeatherSearch isLoading={isLoading} onSubmit={searchWeather} />
        <p className="signal-status" aria-live="polite"><span aria-hidden="true" />{statusMessage}</p>
        {error && <WeatherErrorMessage message={error} />}
        {weather && <WeatherCard weather={weather} temperatureUnit={temperatureUnit} onTemperatureUnitToggle={toggleTemperatureUnit} />}
      </div>
    </main>
  );
}

export default App;
