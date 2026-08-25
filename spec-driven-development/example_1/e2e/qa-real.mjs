import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5102'
const cities = [
  'São Paulo', 'Rio de Janeiro', 'Curitiba', 'Salvador', 'Recife',
  'Lisboa', 'Porto', 'Madrid', 'Paris', 'London',
  'New York', 'Toronto', 'Mexico City', 'Buenos Aires', 'Santiago',
  'Tokyo', 'Seoul', 'Sydney', 'Cape Town', 'Cairo',
]

const browser = await chromium.launch()
const page = await browser.newPage()
const samples = []

try {
  await page.goto(baseUrl)
  for (const city of cities) {
    const startedAt = performance.now()
    await page.getByRole('textbox', { name: 'Qual cidade você quer consultar?' }).fill(city)
    await page.getByRole('button', { name: 'Buscar clima' }).click()
    await page.getByRole('heading', { level: 2, name: /,/ }).waitFor()
    samples.push({ city, durationMs: Math.round(performance.now() - startedAt) })
  }
} finally {
  await browser.close()
}

const durations = samples.map((sample) => sample.durationMs).sort((first, second) => first - second)
const p95 = durations[Math.ceil(durations.length * 0.95) - 1]
const report = {
  executedAt: new Date().toISOString(),
  baseUrl,
  sampleSize: samples.length,
  p95Ms: p95,
  passed: p95 <= 3_000,
  network: process.env.E2E_NETWORK ?? 'not specified',
  samples,
}

await mkdir('../tasks/prd-weather-panel/evidences', { recursive: true })
await writeFile('../tasks/prd-weather-panel/evidences/real-performance.json', `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
