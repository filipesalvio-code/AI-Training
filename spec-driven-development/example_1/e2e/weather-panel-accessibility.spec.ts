import { expect, test, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const evidenceDirectory = '../tasks/prd-weather-panel/evidences'

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true })
})

async function searchCity(page: Page, city: string) {
  await page.getByRole('textbox', { name: 'Qual cidade você quer consultar?' }).fill(city)
  await page.getByRole('button', { name: 'Buscar clima' }).click()
}

async function expectSuccess(page: Page, city: string) {
  await expect(page.getByRole('heading', { name: new RegExp(city) })).toBeVisible()
  await expect(page.getByText('Parcialmente nublado')).toBeVisible()
}

test('E2E-06 exibe loading e impede envio duplicado', async ({ page }) => {
  let weatherRequests = 0
  page.on('request', (request) => { if (request.url().includes('/weather?')) weatherRequests += 1 })
  await page.goto('/')
  await searchCity(page, 'Delayed City')
  await expect(page.getByRole('status')).toContainText('Consultando')
  await expect(page.getByRole('button', { name: 'Consultando...' })).toBeDisabled()
  await expectSuccess(page, 'Delayed City')
  expect(weatherRequests).toBe(1)
})

test('E2E-07 opera por teclado e anuncia mudanças de estado', async ({ page }) => {
  await page.goto('/')
  const input = page.getByRole('textbox', { name: 'Qual cidade você quer consultar?' })
  await input.focus()
  await expect(input).toBeFocused()
  await input.fill('Delayed City')
  await input.press('Enter')
  await expect(page.getByRole('status')).toBeVisible()
  await expectSuccess(page, 'Delayed City')
})

test('E2E-08 mantém layout operável em 360 px e 1280 px', async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.getByRole('textbox', { name: 'Qual cidade você quer consultar?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Buscar clima' })).toBeVisible()
    await page.screenshot({ path: `${evidenceDirectory}/responsive-${width}.png`, fullPage: true })
  }
})

test('E2E-09 mede o orçamento fim a fim da consulta', async ({ page }) => {
  const samples: number[] = []
  await page.goto('/')
  for (let index = 0; index < 20; index += 1) {
    const startedAt = performance.now()
    await searchCity(page, `Performance City ${index}`)
    await expectSuccess(page, `Performance City ${index}`)
    samples.push(performance.now() - startedAt)
  }
  const sortedSamples = [...samples].sort((first, second) => first - second)
  const p95 = sortedSamples[Math.ceil(sortedSamples.length * 0.95) - 1]
  await mkdir(evidenceDirectory, { recursive: true })
  await writeFile(`${evidenceDirectory}/controlled-performance.json`, `${JSON.stringify({ executedAt: new Date().toISOString(), sampleSize: samples.length, p95Ms: Math.round(p95), passed: p95 <= 3_000, samples: samples.map((sample) => Math.round(sample)) }, null, 2)}\n`)
  expect(p95).toBeLessThanOrEqual(3_000)
})
