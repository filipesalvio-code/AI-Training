import { expect, test, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const successCity = 'São Paulo'
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

test('E2E-01 pesquisa cidade e exibe o primeiro resultado completo', async ({ page }) => {
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

test('E2E-02 garante que o navegador não chama a Open-Meteo', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
  expect(requests.some((url) => url.includes('open-meteo.com'))).toBe(false)
  expect(requests.some((url) => url.startsWith('http://127.0.0.1:3001/weather'))).toBe(true)
})

test('E2E-03 corrige entrada inválida sem requisição', async ({ page }) => {
  let weatherRequests = 0
  page.on('request', (request) => { if (request.url().includes('/weather?')) weatherRequests += 1 })
  await page.goto('/')
  await searchCity(page, ' a ')
  const feedback = page.getByRole('alert')
  await expect(feedback).toContainText('pelo menos dois caracteres')
  await expect(page.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('textbox')).toHaveAttribute('aria-describedby', 'city-feedback')
  expect(weatherRequests).toBe(0)
  await page.screenshot({ path: `${evidenceDirectory}/validation-error.png`, fullPage: true })
})

test('E2E-04 recupera-se de cidade não encontrada', async ({ page }) => {
  await page.goto('/')
  await searchCity(page, 'Atlantis')
  await expect(page.getByRole('alert')).toContainText('Cidade não encontrada')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
})

test('E2E-05 limpa sucesso anterior após indisponibilidade e permite retry', async ({ page }) => {
  await page.goto('/')
  await searchCity(page, successCity)
  await expectSuccess(page, successCity)
  await searchCity(page, 'Retry City')
  await expect(page.getByRole('alert')).toContainText('Não foi possível consultar o clima agora')
  await expect(page.getByText('Parcialmente nublado')).toHaveCount(0)
  await page.screenshot({ path: `${evidenceDirectory}/unavailable-error.png`, fullPage: true })
  await searchCity(page, 'Retry City')
  await expectSuccess(page, 'Retry City')
})
