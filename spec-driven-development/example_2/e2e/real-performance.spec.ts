import { expect, test } from '@playwright/test';

test.skip(!process.env.QA_REAL, 'Rodada real de QA exige QA_REAL=1 e serviços reais iniciados');

const cities = ['São Paulo', 'Lisboa', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Cidade do México', 'Londres', 'Cairo', 'Toronto', 'Madrid', 'Roma', 'Berlim', 'Buenos Aires', 'Lima', 'Seul', 'Mumbai', 'Nairobi', 'Auckland', 'Oslo'];

test('E2E-09 registra 20 amostras reais e p95', async ({ page }) => {
  const samples: number[] = [];
  await page.goto('/');
  for (const city of cities) {
    const startedAt = Date.now();
    await page.getByRole('textbox', { name: 'Nome da cidade' }).fill(city);
    await page.getByRole('button', { name: 'Consultar clima' }).click();
    await expect(page.getByRole('heading').nth(1)).toBeVisible({ timeout: 10_000 });
    samples.push(Date.now() - startedAt);
  }
  const sorted = [...samples].sort((first, second) => first - second);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  test.info().annotations.push({ type: 'performance', description: JSON.stringify({ date: new Date().toISOString(), samples, p95, network: 'Open-Meteo real via backend' }) });
  expect(p95).toBeLessThanOrEqual(3000);
});
