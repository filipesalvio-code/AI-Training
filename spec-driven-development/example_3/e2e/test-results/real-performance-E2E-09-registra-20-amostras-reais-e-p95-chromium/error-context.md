# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: real-performance.spec.ts >> E2E-09 registra 20 amostras reais e p95
- Location: real-performance.spec.ts:7:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading').nth(1)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading').nth(1)

```

```yaml
- main:
  - paragraph: PAINEL METEOROLÓGICO
  - heading "Clima de agora" [level=1]
  - paragraph: Consulte as condições atuais de qualquer cidade e veja a localidade resolvida em um instante.
  - region "Consulta meteorológica":
    - text: Nome da cidade
    - textbox "Nome da cidade":
      - /placeholder: "Ex.: São Paulo"
      - text: Oslo
    - button "Consultar clima"
    - alert:
      - paragraph: Não foi possível consultar o clima agora. Tente novamente em instantes.
      - paragraph: Confira o nome da cidade e tente novamente.
  - text: Atualizado sob demanda · sem histórico de buscas
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.skip(!process.env.QA_REAL, 'Rodada real de QA exige QA_REAL=1 e serviços reais iniciados');
  4  | 
  5  | const cities = ['São Paulo', 'Lisboa', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Cidade do México', 'Londres', 'Cairo', 'Toronto', 'Madrid', 'Roma', 'Berlim', 'Buenos Aires', 'Lima', 'Seul', 'Mumbai', 'Nairobi', 'Auckland', 'Oslo'];
  6  | 
  7  | test('E2E-09 registra 20 amostras reais e p95', async ({ page }) => {
  8  |   const samples: number[] = [];
  9  |   await page.goto('/');
  10 |   for (const city of cities) {
  11 |     const startedAt = Date.now();
  12 |     await page.getByRole('textbox', { name: 'Nome da cidade' }).fill(city);
  13 |     await page.getByRole('button', { name: 'Consultar clima' }).click();
> 14 |     await expect(page.getByRole('heading').nth(1)).toBeVisible({ timeout: 10_000 });
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  15 |     samples.push(Date.now() - startedAt);
  16 |   }
  17 |   const sorted = [...samples].sort((first, second) => first - second);
  18 |   const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  19 |   test.info().annotations.push({ type: 'performance', description: JSON.stringify({ date: new Date().toISOString(), samples, p95, network: 'Open-Meteo real via backend' }) });
  20 |   expect(p95).toBeLessThanOrEqual(3000);
  21 | });
  22 | 
```