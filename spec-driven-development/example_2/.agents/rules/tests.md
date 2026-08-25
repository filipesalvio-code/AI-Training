# Test rules

These rules apply to frontend, backend, and E2E tests in the project.

## Required coverage

<critical>**All code must be covered by automated tests. This is a critical rule and must not be ignored.**</critical>

The minimum required coverage is 80%. The percentage alone is not enough: tests must validate behaviors, requirements, and relevant scenarios with strong assertions or expects.

Prioritize code with higher business risk. For example, a checkout flow is more critical than registering a product category and should get deeper tests, including success, failure, limits, and recovery.

Do not inflate coverage only to hit the minimum percentage. Code without relevant behavior should not get artificial tests, and critical code must not go untested because overall coverage already passed.

## FIRST principle

Tests must follow the FIRST principle. The Timely aspect can be ignored in this project.

### Fast

Tests must run quickly. Prefer unit tests and avoid slow external dependencies such as network, real databases, queues, and third-party services.

Use stubs to replace dependencies whose execution is not relevant to the behavior under test.

```ts
const paymentGateway = {
  authorize: async () => ({ authorized: true }),
};

const result = await checkoutService.checkout(order, paymentGateway);

expect(result.status).toBe('approved');
```

### Independent

Each test must be independent of the others. A test must not depend on execution order, state created by another test, or shared mutable data.

Prepare required data inside the test itself or in an isolated setup. If one test fails, the others must still be able to report their own results.

```ts
it('calculates shipping for a valid order', () => {
  const order = makeOrder({ total: 100 });

  expect(calculateShipping(order)).toBe(10);
});
```

### Repeatable

When run repeatedly, tests must produce the same results. Do not depend on the current time, random numbers, external calls, or mutable data.

Use mocks to control the clock, random generators, and external API responses.

```ts
vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));

expect(createExpirationDate()).toEqual(new Date('2026-01-16T12:00:00.000Z'));
```

Restore mocks and spies after each test to prevent state leaking between cases.

### Self-validated

The test itself must detect a behavior failure. Tests that only execute code, check coverage, or lack meaningful assertions are not enough.

Validate the return value, final state, side effects, and relevant interactions with dependencies. An assertion should represent a requirement of the behavior under test.

```ts
it('rejects checkout with no items', async () => {
  const result = await checkoutService.checkout({ items: [] });

  expect(result).toEqual({
    status: 'rejected',
    reason: 'ORDER_EMPTY',
  });
});
```

## Test structure

Use one of these structures, keeping each test clear and focused:

- Given/When/Then: context, action, and expected result.
- AAA (Arrange/Act/Assert): preparation, execution, and verification.

Each test must verify a single concept or behavior. Do not mix different requirements in the same case. Prefer several small, expressive tests over one test with many possible failure reasons.

```ts
it('returns an error when the email is invalid', () => {
  const input = { email: 'invalid' };

  const result = validateUser(input);

  expect(result).toEqual({ valid: false, error: 'INVALID_EMAIL' });
});
```

Test names must describe the observed requirement, including the condition and expected result. Avoid generic names such as `should work` or `service test`.

## Order of creating tests

For the best result with efficiency, create tests in this order:

1. Identify requirements and rank flows by business risk and impact.
2. Start with critical business rules in the backend and frontend, covering unit tests first.
3. Add unit tests for validations, error states, limits, and data transformations.
4. Create integration tests for HTTP contracts, persistence, and module collaboration.
5. Finish with a few E2E tests for complete critical flows, such as login, checkout, and order confirmation.
6. Run the suite, analyze failures and coverage gaps, then complement less critical scenarios.

That order reduces initial feedback time, favors fast tests, and avoids using E2E to discover problems that unit tests could catch.

## Test pyramid

Distribute tests according to the test pyramid:

1. A wide base of fast, isolated unit tests for business rules, components, and functions.
2. Fewer integration tests verifying collaboration among modules, adapters, routes, and persistence.
3. A small number of E2E tests covering complete critical flows from the user perspective.

Do not use E2E tests to replace unit or integration tests. Checkout, for example, should have calculation and validation rules tested at unit level, payment collaboration tested at integration level, and the essential flow covered by E2E.

## Tools and organization

Use Vitest for unit and integration tests on the frontend. Use pytest for the Python backend. Configure coverage so execution fails when the minimum 80% coverage is not met.

Use Playwright preferably for E2E tests. E2E tests should live in the `e2e/` folder, outside `frontend/` and `backend/`.

```text
.
├── frontend/
│   └── src/
│       └── **/*.test.tsx
├── backend/
│   └── src/
│       └── **/test_*.py
└── e2e/
    └── checkout.spec.ts
```

Frontend tests should validate visible behavior and relevant interactions, without unnecessary coupling to internal implementation or style structure. Backend tests should validate business rules, HTTP contracts, status codes, payloads, errors, and relevant effects.

Mocks, stubs, and fakes must be used intentionally: replace external or slow dependencies, but do not hide the integration the test intends to verify. In integration tests, prefer controlled dependencies and isolated environments.

Example E2E test with Playwright:

```ts
import { expect, test } from '@playwright/test';

test('customer completes checkout with approved payment', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Complete purchase' }).click();

  await expect(page.getByText('Order confirmed')).toBeVisible();
});
```

Before finishing a change, run tests and coverage checks for the affected apps. A change is complete only when tests pass, minimum coverage is respected, and critical scenarios are protected.
