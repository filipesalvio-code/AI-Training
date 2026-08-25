import type { FormEvent } from 'react'
import { Search } from 'lucide-react'

type WeatherSearchFormProps = {
  city: string
  errorMessage: string | null
  isInvalid: boolean
  isLoading: boolean
  onCityChange: (city: string) => void
  onSubmit: () => void
}

export function WeatherSearchForm({ city, errorMessage, isInvalid, isLoading, onCityChange, onSubmit }: WeatherSearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} aria-label="City search" aria-busy={isLoading}>
      <div className="flex items-end gap-3 max-[420px]:flex-col max-[420px]:items-stretch">
        <CityInput city={city} errorMessage={errorMessage} isInvalid={isInvalid} isLoading={isLoading} onCityChange={onCityChange} />
        <SearchSubmitButton isLoading={isLoading} />
      </div>
    </form>
  )
}

type CityInputProps = Omit<WeatherSearchFormProps, 'onSubmit'>

function CityInput({ city, errorMessage, isInvalid, isLoading, onCityChange }: CityInputProps) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-800">Which city do you want to check?</label>
      <input
        id="city"
        name="city"
        type="text"
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
        placeholder="E.g. São Paulo"
        autoComplete="address-level2"
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-describedby={errorMessage ? 'city-feedback' : undefined}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[#1b6172] focus:ring-4 focus:ring-[#1b6172]/15 disabled:bg-slate-100"
        disabled={isLoading}
      />
    </div>
  )
}

function SearchSubmitButton({ isLoading }: Pick<WeatherSearchFormProps, 'isLoading'>) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#163f4b] px-5 font-semibold text-white shadow-[0_8px_18px_rgba(22,63,75,0.2)] transition hover:bg-[#0f303a] focus:outline-none focus:ring-4 focus:ring-[#f4c95d]/60 disabled:cursor-not-allowed disabled:opacity-60 max-[420px]:w-full"
    >
      <Search size={18} aria-hidden="true" />
      {isLoading ? 'Checking...' : 'Check weather'}
    </button>
  )
}
