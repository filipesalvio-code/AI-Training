import { CloudSun, Compass } from 'lucide-react'
import { useState } from 'react'
import { WeatherFeedback } from '../components/WeatherFeedback'
import { WeatherResult } from '../components/WeatherResult'
import { WeatherSearchForm } from '../components/WeatherSearchForm'
import { useWeatherSearch } from '../hooks/useWeatherSearch'
import type { WeatherSearchState } from '../types/weather-search-state'

export function WeatherView() {
  const [city, setCity] = useState('')
  const { state, search } = useWeatherSearch()
  return <div className="min-h-screen bg-[#edf3f4] text-slate-950"><main className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]"><WeatherIntro /><WeatherWorkspace city={city} state={state} onCityChange={setCity} onSubmit={() => void search(city)} /></main></div>
}

function WeatherIntro() {
  return <aside className="relative isolate overflow-hidden bg-[#163f4b] px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-16"><div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-[#2c7180] opacity-50" aria-hidden="true" /><div className="absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full border-[32px] border-[#f4c95d]/20" aria-hidden="true" /><div className="flex h-full max-w-xl flex-col justify-between gap-16"><div><div className="mb-12 flex items-center gap-3 text-[#f4c95d]"><CloudSun size={30} strokeWidth={1.8} aria-hidden="true" /><span className="text-sm font-bold uppercase tracking-[0.14em]">Painel de clima</span></div><h1 className="max-w-lg text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl">O tempo da sua cidade, sem rodeios.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-200">Consulte as condições atuais de qualquer cidade e encontre temperatura, umidade e vento em uma leitura rápida.</p></div><div className="flex items-start gap-3 border-t border-white/20 pt-5 text-sm leading-6 text-slate-300"><Compass size={20} className="mt-1 shrink-0 text-[#f4c95d]" aria-hidden="true" /><p>Os dados são resolvidos pela localidade mais relevante encontrada para sua busca.</p></div></div></aside>
}

type WeatherWorkspaceProps = { city: string; state: WeatherSearchState; onCityChange: (city: string) => void; onSubmit: () => void }

function WeatherWorkspace({ city, state, onCityChange, onSubmit }: WeatherWorkspaceProps) {
  const isLoading = state.status === 'loading'
  const error = state.status === 'error' ? state.error : null
  return <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16" aria-label="Consulta meteorológica"><div className="mx-auto max-w-2xl"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1b6172]">Condições atuais</p><h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Qual é o clima agora?</h2><p className="mt-3 max-w-xl text-base leading-7 text-slate-600">Digite o nome de uma cidade para consultar o tempo neste momento.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(22,63,75,0.08)] sm:p-7"><WeatherSearchForm city={city} errorMessage={error?.message ?? null} isInvalid={error?.code === 'INVALID_CITY'} isLoading={isLoading} onCityChange={onCityChange} onSubmit={onSubmit} /><div className="mt-4 min-h-6"><WeatherFeedback error={error} isLoading={isLoading} /></div></div>{state.status === 'success' && <div className="mt-6"><WeatherResult result={state.result} /></div>}</div></section>
}
