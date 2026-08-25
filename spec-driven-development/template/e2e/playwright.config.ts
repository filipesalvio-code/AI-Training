import { defineConfig, devices } from '@playwright/test'

const frontendUrl = 'http://127.0.0.1:5101'

export default defineConfig({
  testDir: '.',
  testMatch: 'weather-panel*.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node mock-provider.mjs',
      cwd: '.',
      url: 'http://127.0.0.1:3050/v1/search',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'bash -c "source .venv/bin/activate && PORT=3001 OPEN_METEO_GEOCODING_URL=http://127.0.0.1:3050/v1/search OPEN_METEO_FORECAST_URL=http://127.0.0.1:3050/v1/forecast uvicorn src.main:app --host 127.0.0.1 --port 3001"',
      cwd: '../backend',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5101',
      cwd: '../frontend',
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:3001' },
    },
  ],
})
