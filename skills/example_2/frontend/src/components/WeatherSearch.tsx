import { FormEvent } from 'react';
import { Search } from 'lucide-react';

type WeatherSearchProps = { isLoading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void };

export function WeatherSearch({ isLoading, onSubmit }: WeatherSearchProps) {
  return (
    <form className="weather-search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="city">City</label>
      <Search className="search-icon" size={20} aria-hidden="true" />
      <input id="city" name="city" placeholder="Search for a city" autoComplete="address-level2" />
      <button type="submit" disabled={isLoading}>{isLoading ? 'Reading…' : 'Check weather'}</button>
    </form>
  );
}
