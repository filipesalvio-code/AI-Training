import { FormEvent } from 'react';

type WeatherSearchProps = { isLoading: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void };

export function WeatherSearch({ isLoading, onSubmit }: WeatherSearchProps) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="city">Cidade</label>
      <input id="city" name="city" placeholder="Digite uma cidade" className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-white outline-none ring-indigo-400 transition focus:ring-2" />
      <button type="submit" disabled={isLoading} className="rounded-2xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-60">
        {isLoading ? 'Buscando...' : 'Ver clima'}
      </button>
    </form>
  );
}
