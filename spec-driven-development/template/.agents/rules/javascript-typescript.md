# JavaScript and TypeScript rules

These rules apply to frontend JavaScript and TypeScript. The backend is Python/FastAPI; do not apply Node-specific patterns there. If a rule conflicts with a more specific project rule, follow the more specific one as long as it does not reduce safety or clarity.

## Prefer `const`

Use `const` by default. Use `let` only when the variable must be reassigned. Never use `var`, because it has function scope and allows harder-to-track reassignments.

Avoid:

```ts
var total = 0;
let name = 'Ana';
name = 'Bia';
```

Prefer:

```ts
const total = 0;
let name = 'Ana';
name = 'Bia';
```

Even objects and arrays declared with `const` can have their contents mutated. To avoid accidental mutation, prefer creating new values with `map`, `filter`, and spread:

```ts
type User = {
  id: string;
  name: string;
  active: boolean;
  isAdmin: boolean;
};

function activateUser(user: User): User {
  return { ...user, active: true };
}
```

## Explicit comparisons

Always use `===` and `!==`. Never use `==` or `!=`, because implicit type coercion can produce unexpected results.

Avoid:

```ts
if (userId == 0 || status != 'active') {
  return false;
}
```

Prefer:

```ts
if (userId === 0 || status !== 'active') {
  return false;
}
```

For optional values, evaluate the needed condition explicitly. Use `??` when the intent is to treat only `null` and `undefined`, and use `||` only when other falsy values such as empty string or zero are also invalid:

```ts
const displayName = user.name ?? 'Unnamed user';
const pageSize = configuredPageSize || DEFAULT_PAGE_SIZE;
```

## Required typing and no `any`

Never use `any`. Prefer explicit types, `unknown` for truly unknown values, and type narrowing before use.

Avoid:

```ts
function parseResponse(response: any): any {
  return response.data;
}
```

Prefer:

```ts
type ApiResponse<T> = {
  data: T;
};

function parseResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}
```

When dealing with external input, validate `unknown` before accessing properties:

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getMessage(value: unknown): string | undefined {
  if (!isRecord(value) || typeof value.message !== 'string') {
    return undefined;
  }

  return value.message;
}
```

Type parameters and returns that involve objects. Prefer `type` or `interface` with domain names instead of repeated anonymous objects:

```ts
type CreateProductInput = {
  name: string;
  priceInCents: number;
};

type Product = CreateProductInput & {
  id: string;
};

function createProduct(input: CreateProductInput): Product {
  return { id: crypto.randomUUID(), ...input };
}
```

Typing primitive returns is also recommended when it clarifies the contract. Always type async returns with `Promise<T>`:

```ts
async function loadProduct(id: string): Promise<Product> {
  return productRepository.findById(id);
}
```

## Arrow functions

Prefer arrow functions in callbacks such as those used by `map`, `filter`, `reduce`, `sort`, and `Promise.then`:

```ts
const activeNames = users
  .filter((user: User) => user.active)
  .map((user: User) => user.name);
```

Do not replace named top-level functions with arrow functions for style alone. Main module, service, and handler functions should stay declared with `function` when that improves identification and stack traces:

```ts
function listActiveUsers(users: User[]): string[] {
  return users.filter((user: User) => user.active).map((user: User) => user.name);
}
```

Avoid nested callbacks. Extract logic into named functions or use `async/await`.

## Simple ternaries

Use a ternary only for a short, direct decision. Never nest ternaries, and do not use ternaries as conditional assignment operators or to run side effects.

Avoid:

```ts
const label = isAdmin ? (isActive ? 'Active admin' : 'Inactive admin') : 'User';
isReady ? startProcess() : stopProcess();
```

Prefer:

```ts
const label = isAdmin ? 'Admin' : 'User';

if (isReady) {
  startProcess();
} else {
  stopProcess();
}
```

When there is more than one condition, use `if`, guard clauses, or extract a named function:

```ts
function getAccessLabel(user: User): string {
  if (!user.active) {
    return 'Inactive';
  }

  return user.isAdmin ? 'Admin' : 'User';
}
```

## Immutability and collection operations

Do not mutate parameters, state, or shared collections directly. Return new objects and arrays. Use `map` to transform, `filter` to select, `find` to locate one element, and `reduce` only when the reduction clearly expresses intent.

Avoid:

```ts
function addTag(tags: string[], tag: string): string[] {
  tags.push(tag);
  return tags;
}
```

Prefer:

```ts
function addTag(tags: string[], tag: string): string[] {
  return [...tags, tag];
}
```

Do not mutate objects received as arguments. When sorting is required, copy the collection before calling `sort`:

```ts
function sortByName(users: User[]): User[] {
  return [...users].sort((first: User, second: User) => first.name.localeCompare(second.name));
}
```

## Error handling

Throw `Error` instances with useful messages. Do not catch an error only to ignore it, and do not automatically convert every caught value into an `Error` without preserving context:

```ts
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

async function loadData(): Promise<Data> {
  try {
    return await dataRepository.load();
  } catch (error: unknown) {
    throw new Error(`Failed to load data: ${getErrorMessage(error)}`, { cause: error });
  }
}
```

Use `unknown` in the `catch` parameter when available. Handle the error in the layer that has enough context to decide the response or recovery.

## Imports, modules, and names

Use ES modules with `import` and `export`. Remove unused imports and avoid exporting symbols that are not part of the module contract.

Prefer complete, expressive names. Use `is`, `has`, and `can` for boolean functions, such as `isValidEmail`, `hasPermission`, and `canPublish`. Avoid abbreviations that are not universally understood.

Keep functions short, with a single responsibility, and extract constants for numbers, strings, and regular expressions that represent business rules. Also respect the size limits in `code-standards.md`.

## Required validation

When finishing any task that changes JavaScript or TypeScript, run the linter for the affected app. In this repository:

```bash
cd frontend
npm run lint
```

The linter does not replace `typecheck`, build, or tests; also run the validations required by the app and by the nature of the change.
