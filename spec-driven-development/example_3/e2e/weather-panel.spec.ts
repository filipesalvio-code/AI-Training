import { expect, test } from '@playwright/test';

async function search(page: import('@playwright/test').Page, query: string): Promise<void> {
  await page.getByRole('combobox', { name: 'Nome da cidade' }).fill(query);
}

async function waitForSuggestions(page: import('@playwright/test').Page): Promise<void> {
  await expect(page.getByRole('option').first()).toBeVisible();
}

async function selectFirst(page: import('@playwright/test').Page, query: string): Promise<void> {
  await search(page, query);
  await waitForSuggestions(page);
  await page.getByRole('option').first().click();
  await expect(page.getByRole('heading', { name: query.trim() })).toBeVisible();
}

test('E2E-01 escolhe uma cidade homônima por ponteiro', async ({ page }) => {
  await page.goto('/');
  await search(page, 'Springfield');
  await waitForSuggestions(page);
  await expect(page.getByRole('option')).toHaveCount(2);
  await page.getByRole('option', { name: /Massachusetts/ }).click();
  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
  await expect(page.getByText('Massachusetts · Estados Unidos')).toBeVisible();
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('E2E-02 opera o combobox somente por teclado', async ({ page }) => {
  await page.goto('/');
  await search(page, 'Springfield');
  await waitForSuggestions(page);
  const input = page.getByRole('combobox', { name: 'Nome da cidade' });
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'location-suggestions-option-0');
  await input.press('Enter');
  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
  await search(page, 'Springfield ');
  await waitForSuggestions(page);
  await input.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(input).toBeFocused();
});

test('E2E-03 trata mínimo, vazio e indisponibilidade', async ({ page }) => {
  let locationRequests = 0;
  page.on('request', (request) => { if (request.url().includes('/locations?')) locationRequests += 1; });
  await page.goto('/');
  await search(page, 'a');
  await page.waitForTimeout(250);
  expect(locationRequests).toBe(0);
  await search(page, 'zzzzzz');
  await expect(page.getByRole('status')).toContainText('Nenhuma localidade encontrada');
  await search(page, 'Indisponivel');
  await expect(page.getByRole('alert')).toContainText('Não foi possível buscar localidades');
});

test('E2E-04 mantém somente a resposta da query atual', async ({ page }) => {
  await page.goto('/');
  await search(page, 'Velho');
  await expect(page.getByRole('combobox')).toHaveAttribute('aria-busy', 'true');
  await page.waitForTimeout(250);
  await search(page, 'Novo');
  await waitForSuggestions(page);
  await expect(page.getByRole('option', { name: /Novo/ }).first()).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.getByRole('option', { name: /Velho/ })).toHaveCount(0);
});

test('E2E-05 mede o p95 das sugestões em até 500 ms', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('combobox', { name: 'Nome da cidade' });
  const samples: number[] = [];
  for (let index = 0; index < 20; index += 1) {
    const startedAt = Date.now();
    await input.fill(`Cidade ${index}`);
    await expect(page.getByRole('option').first()).toBeVisible();
    samples.push(Date.now() - startedAt);
  }
  const sorted = [...samples].sort((first, second) => first - second);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  expect(p95).toBeLessThanOrEqual(500);
});

test('E2E-06 mantém o autocomplete responsivo', async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await search(page, 'Springfield');
    await waitForSuggestions(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('E2E-08 exibe o painel e alterna temperatura sem nova busca', async ({ page }) => {
  let weatherRequests = 0;
  page.on('request', (request) => { if (request.url().endsWith('/weather')) weatherRequests += 1; });
  await page.goto('/');
  await selectFirst(page, 'São Paulo');
  await expect(page.getByText('24°C')).toBeVisible();
  await page.getByRole('button', { name: 'Fahrenheit (°F)' }).click();
  await expect(page.getByText('76°F')).toBeVisible();
  expect(weatherRequests).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
