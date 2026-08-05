import { LanguageProvider } from './components/LanguageProvider';
import { WeatherView } from './views/WeatherView';

function App() {
  return <LanguageProvider><WeatherView /></LanguageProvider>;
}

export default App;
