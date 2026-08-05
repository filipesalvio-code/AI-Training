import { expect, test } from '@playwright/test';

const evidenceDir = '../tasks/prd-painel-de-clima/evidences';

async function submit(page: import('@playwright/test').Page, city: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Nome da cidade' }).fill(city);
  await page.getByRole('button', { name: 'Consultar clima' }).click();
}

test('E2E-01 pesquisa cidade e exibe o primeiro resultado completo', async ({ page }) => {
  await page.goto('/');
  await submit(page, 'São Paulo');
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByText('São Paulo · Brasil')).toBeVisible();
  await expect(page.getByText('24.3°C')).toBeVisible();
  await expect(page.getByText('25.1°C')).toBeVisible();
  await expect(page.getByText('72%')).toBeVisible();
  await expect(page.getByText('12.4km/h')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/');
  await page.screenshot({ path: `${evidenceDir}/e2e-01-success.png`, fullPage: true });
});

test('E2E-02 garante que o navegador não chama a Open-Meteo', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await submit(page, 'Lisboa');
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  expect(requests.some((url) => url.includes('open-meteo.com'))).toBe(false);
  expect(requests.some((url) => url.includes('/weather?city='))).toBe(true);
});

test('E2E-03 corrige entrada inválida sem requisição', async ({ page }) => {
  let weatherRequests = 0;
  page.on('request', (request) => { if (request.url().includes('/weather?city=')) weatherRequests += 1; });
  await page.goto('/');
  await submit(page, 'a');
  await expect(page.getByRole('alert')).toContainText('pelo menos dois caracteres');
  await expect(page.getByRole('textbox', { name: 'Nome da cidade' })).toHaveAttribute('aria-invalid', 'true');
  expect(weatherRequests).toBe(0);
  await page.screenshot({ path: `${evidenceDir}/e2e-03-validation.png`, fullPage: true });
});

test('E2E-04 recupera-se de cidade não encontrada', async ({ page }) => {
  await page.goto('/');
  await submit(page, 'Atlantis');
  await expect(page.getByRole('alert')).toContainText('Cidade não encontrada');
  await submit(page, 'Lisboa');
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
});

test('E2E-05 limpa sucesso após indisponibilidade e permite retry', async ({ page }) => {
  await page.goto('/');
  await submit(page, 'Lisboa');
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await submit(page, 'Indisponivel');
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('Não foi possível consultar');
  await submit(page, 'Porto');
  await expect(page.getByRole('heading', { name: 'Porto' })).toBeVisible();
});

test('E2E-06 exibe loading e impede envio duplicado', async ({ page }) => {
  let weatherRequests = 0;
  page.on('request', (request) => { if (request.url().includes('/weather?city=')) weatherRequests += 1; });
  await page.goto('/');
  await submit(page, 'Lento');
  await expect(page.getByRole('status')).toContainText('Consultando');
  await expect(page.getByRole('button', { name: 'Consultando…' })).toBeDisabled();
  expect(weatherRequests).toBe(1);
  await expect(page.getByRole('heading', { name: 'Lento' })).toBeVisible();
});

test('E2E-07 opera por teclado e anuncia mudanças de estado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Nome da cidade' })).toBeFocused();
  await page.keyboard.type('Lisboa');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
});

test('E2E-08 mantém layout operável em 360 px e 1280 px', async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Clima de agora' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `${evidenceDir}/e2e-08-${width}.png`, fullPage: true });
  }
});

test('E2E-09 mede o orçamento fim a fim controlado', async ({ page }) => {
  await page.goto('/');
  const samples: number[] = [];
  for (let index = 0; index < 20; index += 1) {
    const startedAt = Date.now();
    await submit(page, `Cidade ${index}`);
    await expect(page.getByRole('heading', { name: `Cidade ${index}` })).toBeVisible();
    samples.push(Date.now() - startedAt);
  }
  const sorted = [...samples].sort((first, second) => first - second);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  expect(p95).toBeLessThanOrEqual(3000);
});
