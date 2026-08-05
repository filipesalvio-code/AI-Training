import { useState } from 'react';
import { WeatherFeedback } from '../components/WeatherFeedback';
import { WeatherResult } from '../components/WeatherResult';
import { WeatherSearchForm } from '../components/WeatherSearchForm';
import { useWeatherSearch } from '../hooks/useWeatherSearch';

export function WeatherView() {
  const [city, setCity] = useState('');
  const { state, search } = useWeatherSearch();
  const isLoading = state.status === 'loading';
  const validationMessage = state.status === 'error' && state.error.code === 'INVALID_CITY' ? state.error.message : undefined;
  return <main className="min-h-screen bg-slate-950 text-slate-100" aria-busy={isLoading}><div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10 lg:px-16 lg:py-16"><header className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">PAINEL METEOROLÓGICO</p><h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Clima de agora</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-400">Consulte as condições atuais de qualquer cidade e veja a localidade resolvida em um instante.</p></header><section className="mt-14" aria-label="Consulta meteorológica"><WeatherSearchForm city={city} disabled={isLoading} validationMessage={validationMessage} onCityChange={setCity} onSubmit={() => search(city)} /><div className="mt-8"><WeatherFeedback state={state} /></div></section>{state.status === 'success' ? <section className="mt-14"><WeatherResult weather={state.data} /></section> : null}<footer className="mt-auto pt-16 text-sm text-slate-500">Atualizado sob demanda · sem histórico de buscas</footer></div></main>;
}
