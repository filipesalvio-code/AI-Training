export type Environment = {
  port: number;
  corsOrigin: string;
  geocodingUrl: string;
  forecastUrl: string;
  timeoutMs: number;
};

const DEFAULT_PORT = 3000;
const DEFAULT_TIMEOUT_MS = 2500;

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Configuração numérica inválida');
  }
  return parsed;
}

export function loadEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
  return {
    port: parsePositiveInteger(source.PORT, DEFAULT_PORT),
    corsOrigin: source.CORS_ORIGIN ?? 'http://localhost:5173',
    geocodingUrl: source.OPEN_METEO_GEOCODING_URL ?? 'https://geocoding-api.open-meteo.com/v1/search',
    forecastUrl: source.OPEN_METEO_FORECAST_URL ?? 'https://api.open-meteo.com/v1/forecast',
    timeoutMs: parsePositiveInteger(source.OPEN_METEO_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  };
}
