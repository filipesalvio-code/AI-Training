import { expect, test } from '@playwright/test';

async function search(page: import('@playwright/test').Page, query: string): Promise<void> {
  await page.getByRole('combobox', { name: 'Nome da cidade' }).fill(query);
  await expect(page.getByRole('option').first()).toBeVisible();
}

test('E2E-07 opera por teclado e mantém a ordem de foco acessível', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Idioma atual: português. Trocar para inglês.' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Nome da cidade' })).toBeFocused();
  await page.keyboard.type('Springfield');
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
});

test('E2E-09 não expõe a Open-Meteo ao navegador', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await search(page, 'Lisboa');
  await page.getByRole('option').first().click();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  expect(requests.some((url) => url.includes('open-meteo.com'))).toBe(false);
});

test('E2E-11 anuncia indisponibilidade de sugestões e permite nova tentativa', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Nome da cidade' }).fill('Indisponivel');
  await expect(page.getByRole('alert')).toContainText('Não foi possível buscar localidades');
  await search(page, 'Porto');
  await page.getByRole('option').first().click();
  await expect(page.getByRole('heading', { name: 'Porto' })).toBeVisible();
});
