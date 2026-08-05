import { useState } from 'react';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { WeatherFeedback } from '../components/WeatherFeedback';
import { WeatherHeader } from '../components/WeatherHeader';
import { WeatherResult } from '../components/WeatherResult';
import { useLocationSuggestions } from '../hooks/useLocationSuggestions';
import { useTranslation } from '../hooks/useTranslation';
import { useWeatherSearch } from '../hooks/useWeatherSearch';
import type { LocationSuggestion } from '../types/location-suggestion';
import type { TemperatureUnit } from '../types/temperature-unit';

export function WeatherView() {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const locationSearch = useLocationSuggestions(query, selectedLocation === null);
  const weatherSearch = useWeatherSearch();
  const { t } = useTranslation();
  const isWeatherLoading = weatherSearch.state.status === 'loading';

  const handleQueryChange = (value: string): void => {
    setQuery(value);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: LocationSuggestion): void => {
    setQuery(location.city);
    setSelectedLocation(location);
    locationSearch.dismiss();
    weatherSearch.search(location);
  };

  return <main className="min-h-screen bg-slate-950 text-slate-100" aria-busy={isWeatherLoading}>
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
      <WeatherHeader eyebrow={t('header.eyebrow')} title={t('header.title')} subtitle={t('header.subtitle')} />
      <section className="mt-14" aria-label={t('search.sectionLabel')}>
        <LocationAutocomplete value={query} state={locationSearch.state} onValueChange={handleQueryChange} onSelect={handleLocationSelect} onDismiss={locationSearch.dismiss} />
        <div className="mt-8"><WeatherFeedback state={weatherSearch.state} /></div>
      </section>
      {weatherSearch.state.status === 'success' ? <section className="mt-14"><WeatherResult weather={weatherSearch.state.data} unit={unit} onUnitChange={setUnit} /></section> : null}
      <footer className="mt-auto pt-16 text-sm text-slate-500">{t('footer.note')}</footer>
    </div>
  </main>;
}
