import { useCallback, useEffect, useRef, useState } from 'react'
import { weatherService, type WeatherService } from '../services/weather-service'
import { WeatherApiError, type ApiErrorDetails } from '../types/api-error'
import type { WeatherSearchResult, WeatherSearchState } from '../types/weather-search-state'

const INVALID_CITY_MESSAGE = 'Enter a city with at least two characters.'
const UNAVAILABLE_MESSAGE = 'We could not check the weather right now. Try again shortly.'
const ALPHANUMERIC_PATTERN = /[\p{L}\p{N}]/u

function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/gu, ' ')
}

function isValidCity(city: string): boolean {
  return Array.from(city).filter((character) => ALPHANUMERIC_PATTERN.test(character)).length >= 2
}

function createErrorDetails(error: unknown): ApiErrorDetails {
  if (error instanceof WeatherApiError) return { code: error.code, message: error.message }
  return { code: 'WEATHER_SERVICE_UNAVAILABLE', message: UNAVAILABLE_MESSAGE }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useWeatherSearch(service: WeatherService = weatherService): WeatherSearchResult {
  const [state, setState] = useState<WeatherSearchState>({ status: 'idle', result: null, error: null })
  const mountedRef = useRef(true)
  const requestInFlightRef = useRef(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
    }
  }, [])

  const search = useCallback(async (city: string): Promise<void> => {
    if (requestInFlightRef.current) return
    const normalizedCity = normalizeCity(city)
    if (!isValidCity(normalizedCity)) {
      setState({ status: 'error', result: null, error: { code: 'INVALID_CITY', message: INVALID_CITY_MESSAGE } })
      return
    }
    requestInFlightRef.current = true
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'loading', result: null, error: null })
    try {
      const result = await service.search(normalizedCity, controller.signal)
      if (mountedRef.current) setState({ status: 'success', result, error: null })
    } catch (error: unknown) {
      if (mountedRef.current && !isAbortError(error)) {
        setState({ status: 'error', result: null, error: createErrorDetails(error) })
      }
    } finally {
      requestInFlightRef.current = false
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [service])

  return { state, search }
}
