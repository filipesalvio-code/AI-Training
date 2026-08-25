import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const successCity = 'São Paulo'
const evidenceDirectory = '../tasks/prd-weather-panel/evidences'

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true })
})

async function searchCity(page: Page, city: string) {
  await page.getByRole('textbox', { name: 'Which city do you want to check?' }).fill(city)
  await page.getByRole('button', { name: 'Check weather' }).click()
}

async function expectSuccess(page: Page, city: string) {
  await expect(page.getByRole('heading', { name: new RegExp(city) })).toBeVisible()
  await expect(page.getByText('Partly cloudy')).toBeVisible()
}

test('E2E-01 search city and display complete result', async ({ page }) => {
  await page.goto('/')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
  await expect(page.getByText('24.3°C')).toBeVisible()
  await expect(page.getByText('25.1°C')).toBeVisible()
  await expect(page.getByText('72%')).toBeVisible()
  await expect(page.getByText('12.4 km/h')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/')
  await expect(page.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/')
  await page.screenshot({ path: `${evidenceDirectory}/success.png`, fullPage: true })
})

test('E2E-02 browser never calls Open-Meteo directly', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
  expect(requests.some((url) => url.includes('open-meteo.com'))).toBe(false)
  expect(requests.some((url) => url.startsWith('http://127.0.0.1:3001/weather'))).toBe(true)
})

test('E2E-03 invalid input without weather request', async ({ page }) => {
  let weatherRequests = 0
  page.on('request', (request) => { if (request.url().includes('/weather?')) weatherRequests += 1 })
  await page.goto('/')
  await searchCity(page, ' a ')
  const feedback = page.getByRole('alert')
  await expect(feedback).toContainText('at least two characters')
  await expect(page.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('textbox')).toHaveAttribute('aria-describedby', 'city-feedback')
  expect(weatherRequests).toBe(0)
  await page.screenshot({ path: `${evidenceDirectory}/validation-error.png`, fullPage: true })
})

test('E2E-04 recovers from city not found', async ({ page }) => {
  await page.goto('/')
  await searchCity(page, 'Atlantis')
  await expect(page.getByRole('alert')).toContainText('City not found')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
})

test('E2E-05 clears previous success after unavailability and retries', async ({ page }) => {
  await page.goto('/')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
  await searchCity(page, 'Retry City')
  await expect(page.getByRole('alert')).toContainText('could not check the weather')
  await expect(page.getByText('Partly cloudy')).toHaveCount(0)
  await page.screenshot({ path: `${evidenceDirectory}/unavailable-error.png`, fullPage: true })
  await searchCity(page, 'Retry City')
  await expectSuccess(page, 'Retry City')
})
