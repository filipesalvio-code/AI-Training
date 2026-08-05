import { defineConfig, devices } from '@playwright/test';

const deterministic = !process.env.QA_REAL;
const mockPort = process.env.E2E_MOCK_PORT ?? '3070';
const backendPort = process.env.E2E_BACKEND_PORT ?? '3000';
const frontendPort = process.env.E2E_FRONTEND_PORT ?? '5100';
const mockUrl = `http://127.0.0.1:${mockPort}`;
const backendUrl = `http://127.0.0.1:${backendPort}`;
const frontendUrl = `http://127.0.0.1:${frontendPort}`;

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.REAL_BASE_URL ?? frontendUrl, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: deterministic ? [
    { command: 'node mock-open-meteo.mjs', cwd: '.', env: { MOCK_PORT: mockPort }, url: `${mockUrl}/health`, reuseExistingServer: false },
    { command: `npm run dev -- --host 127.0.0.1 --port ${backendPort}`, cwd: '../backend', env: { PORT: backendPort, CORS_ORIGIN: frontendUrl, OPEN_METEO_GEOCODING_URL: `${mockUrl}/v1/search`, OPEN_METEO_FORECAST_URL: `${mockUrl}/v1/forecast` }, url: `${backendUrl}/health`, reuseExistingServer: false },
    { command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`, cwd: '../frontend', env: { VITE_API_BASE_URL: backendUrl }, url: frontendUrl, reuseExistingServer: false },
  ] : undefined,
});
