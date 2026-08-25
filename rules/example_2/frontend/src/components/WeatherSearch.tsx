import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WeatherSearchProps = { loading: boolean; onSearch: (city: string) => Promise<void> };

export function WeatherSearch({ loading, onSearch }: WeatherSearchProps) {
  const [city, setCity] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const value = city.trim();
    if (value) await onSearch(value);
  }
  return <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" role="search"><label htmlFor="city" className="sr-only">City</label><input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Enter a city" className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none ring-blue-500 focus:ring-2" /><button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"><Search className="h-4 w-4" aria-hidden="true" />{loading ? 'Checking...' : 'Check weather'}</button></form>;
}
