import { expect, test } from '@playwright/test';

test('troca o idioma do painel sem repetir a requisição de clima', async ({ page }) => {
  let weatherRequests = 0;
  page.on('request', (request) => { if (request.url().endsWith('/weather')) weatherRequests += 1; });
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Nome da cidade' }).fill('Springfield');
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.getByRole('option', { name: /Illinois/ }).click();
  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
  await page.getByRole('button', { name: 'Idioma atual: português. Trocar para inglês.' }).click();
  await expect(page.getByRole('heading', { name: 'Weather right now' })).toBeVisible();
  await expect(page.getByText('Partly cloudy').first()).toBeVisible();
  await expect(page.getByText('Illinois · United States')).toBeVisible();
  expect(weatherRequests).toBe(1);
  expect(await page.title()).toBe('Weather right now');
});

test('traduz feedback de erro e mantém a consulta digitada', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('combobox', { name: 'Nome da cidade' });
  await input.fill('Indisponivel');
  await expect(page.getByRole('alert')).toContainText('Não foi possível buscar localidades');
  await page.getByRole('button', { name: 'Idioma atual: português. Trocar para inglês.' }).click();
  await page.getByRole('combobox', { name: 'City name' }).fill('Indisponivel ');
  await expect(page.getByRole('alert')).toContainText('We could not search locations');
});
