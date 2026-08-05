import { LoaderCircle, TriangleAlert } from 'lucide-react'
import type { ApiErrorDetails } from '../types/api-error'

type WeatherFeedbackProps = {
  error: ApiErrorDetails | null
  isLoading: boolean
}

export function WeatherFeedback({ error, isLoading }: WeatherFeedbackProps) {
  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-[#1b6172]" role="status" aria-live="polite" aria-busy="true">
        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
        Consultando as condições atuais...
      </p>
    )
  }
  if (!error) return null
  return (
    <p id="city-feedback" className="flex items-start gap-2 text-sm font-medium text-red-800" role="alert" aria-live="assertive">
      <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{error.message}</span>
    </p>
  )
}
