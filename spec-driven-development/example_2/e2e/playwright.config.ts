import { defineConfig, devices } from '@playwright/test';

const deterministic = !process.env.QA_REAL;

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.REAL_BASE_URL ?? 'http://127.0.0.1:5100', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: deterministic ? [
    { command: 'node mock-open-meteo.mjs', cwd: '.', url: 'http://127.0.0.1:3070/health', reuseExistingServer: false },
    { command: 'npm run dev -- --host 127.0.0.1 --port 3000', cwd: '../backend', env: { PORT: '3000', CORS_ORIGIN: 'http://127.0.0.1:5100', OPEN_METEO_GEOCODING_URL: 'http://127.0.0.1:3070/v1/search', OPEN_METEO_FORECAST_URL: 'http://127.0.0.1:3070/v1/forecast' }, url: 'http://127.0.0.1:3000/health', reuseExistingServer: false },
    { command: 'npm run dev -- --host 127.0.0.1 --port 5100', cwd: '../frontend', env: { VITE_API_BASE_URL: 'http://127.0.0.1:3000' }, url: 'http://127.0.0.1:5100', reuseExistingServer: false },
  ] : undefined,
});
