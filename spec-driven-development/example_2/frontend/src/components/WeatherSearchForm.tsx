import type { FormEvent } from 'react';

type WeatherSearchFormProps = {
  city: string;
  disabled: boolean;
  validationMessage?: string;
  onCityChange: (city: string) => void;
  onSubmit: () => void;
};

export function WeatherSearchForm({ city, disabled, validationMessage, onCityChange, onSubmit }: WeatherSearchFormProps) {
  const describedBy = validationMessage ? 'city-error' : undefined;
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit();
  };
  return <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit} noValidate>
    <div className="flex-1"><label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="city">City name</label><input id="city" name="city" value={city} onChange={(event) => onCityChange(event.target.value)} aria-describedby={describedBy} aria-invalid={validationMessage ? true : undefined} autoComplete="address-level2" className="w-full border-b-2 border-slate-500 bg-transparent px-0 py-3 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-0" placeholder="E.g. São Paulo" />{validationMessage ? <p id="city-error" className="mt-2 text-sm text-amber-200" role="alert">{validationMessage}</p> : null}</div>
    <button type="submit" disabled={disabled} className="min-h-12 rounded-sm bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-wait disabled:bg-slate-600 disabled:text-white">{disabled ? 'Checking…' : 'Check weather'}</button>
  </form>;
}
