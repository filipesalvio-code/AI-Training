# Coding standards

These rules apply to the frontend and the backend, unless a project-specific technical constraint says otherwise.

## Do not insert comments

Do not insert comments in code. Write clear code with names that express intent and small functions that explain the flow by themselves.

Comments are allowed only when absolutely necessary, for example to explain a complex regular expression or a technical decision that cannot be expressed in code.

```ts
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return emailPattern.test(email);
}
```

Prefer expressive names and function extraction:

```ts
function canPublishArticle(article: Article): boolean {
  return article.status === 'draft' && article.authorId !== undefined;
}
```

## Limit classes and files to 100 lines

Classes and `.ts` / `.py` files must have at most 100 lines. When that limit is reached, extract responsibilities into other cohesive classes, functions, or files.

```ts
class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async create(orderData: CreateOrderData): Promise<Order> {
    const order = this.buildOrder(orderData);
    await this.paymentService.authorize(order.total);
    return this.orderRepository.save(order);
  }

  private buildOrder(orderData: CreateOrderData): Order {
    return new Order(orderData.items, orderData.customerId);
  }
}
```

If the class or file grows, separate validation, persistence, and business rules into their own modules.

## Limit methods and functions to 30 lines

Methods and functions must have at most 30 lines. If the behavior is larger, split it into private methods or helper functions with clear responsibilities.

```ts
function registerUser(input: RegisterUserInput): User {
  validateUserInput(input);
  const normalizedEmail = normalizeEmail(input.email);
  const passwordHash = hashPassword(input.password);

  return userRepository.create({
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash,
  });
}
```

Each extracted function must keep a single responsibility and stay within the 30-line limit.

## Prefer guard clauses

Do not nest more than three levels of `if`/`else`. Prefer guard clauses and early returns to end invalid or exceptional cases before the main flow.

Avoid:

```ts
function processPayment(order?: Order): PaymentResult {
  if (order) {
    if (order.isReady) {
      if (order.total > 0) {
        return charge(order);
      }
    }
  }

  return { success: false };
}
```

Prefer:

```ts
function processPayment(order?: Order): PaymentResult {
  if (!order || !order.isReady || order.total <= 0) {
    return { success: false };
  }

  return charge(order);
}
```

When there are several independent cases, return early in each one and keep the success path at the lowest indentation level possible.

## Limit parameters to three

Avoid methods and functions with more than three parameters. When several values belong to the same context, group them in a named parameter object.

Avoid:

```ts
function createUser(
  name: string,
  email: string,
  role: string,
  active: boolean,
): User {
  return userRepository.create({ name, email, role, active });
}
```

Prefer:

```ts
type CreateUserInput = {
  name: string;
  email: string;
  role: string;
  active: boolean;
};

function createUser(input: CreateUserInput): User {
  return userRepository.create(input);
}
```

The parameter object must represent a domain concept, not merely hide unrelated parameters.

## Avoid blank lines inside methods and functions

Avoid blank lines inside methods and functions. Visual organization should come from function extraction and clear names. Blank lines are allowed between class members and between functions in a file.

Avoid:

```ts
function calculateTotal(items: Item[]): number {
  const validItems = items.filter((item) => item.isValid);

  const subtotal = validItems.reduce((total, item) => total + item.price, 0);

  return applyDiscount(subtotal);
}
```

Prefer:

```ts
function calculateTotal(items: Item[]): number {
  const validItems = items.filter((item) => item.isValid);
  const subtotal = validItems.reduce((total, item) => total + item.price, 0);
  return applyDiscount(subtotal);
}
```

## Extract magic numbers and strings

Extract numbers and strings used as business rules, limits, codes, or keys into constants with names that clarify their meaning.

Avoid:

```ts
if (user.loginAttempts >= 5) {
  lockUser(user);
}

if (response.status === 404) {
  return null;
}
```

Prefer:

```ts
const MAX_LOGIN_ATTEMPTS = 5;
const NOT_FOUND_STATUS = 404;

if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
  lockUser(user);
}

if (response.status === NOT_FOUND_STATUS) {
  return null;
}
```

Constants must be declared in an appropriate scope and named for the meaning of the value, not only its type.

## Declare variables close to use

Declare variables as close as possible to where they are used. Avoid declaring values at the start of a method when they are only needed much later.

Avoid:

```ts
function sendInvoice(order: Order): void {
  const customer = customerRepository.findById(order.customerId);
  const invoice = invoiceService.create(order);
  const recipient = customer.email;
  const message = buildInvoiceMessage(invoice);

  auditService.record(order.id);
  emailService.send(recipient, message);
}
```

Prefer:

```ts
function sendInvoice(order: Order): void {
  const invoice = invoiceService.create(order);
  const message = buildInvoiceMessage(invoice);
  const customer = customerRepository.findById(order.customerId);
  const recipient = customer.email;
  emailService.send(recipient, message);
  auditService.record(order.id);
}
```

That proximity reduces variable scope and makes the flow easier to read.

## Keep sensitive data out of code

Never put sensitive data such as API keys, tokens, passwords, or credentials directly in code or in the repository. Store them in an external `.env` file, keep `.env` out of version control, and provide a `.env.example` without real values when needed.

Avoid:

```ts
const paymentApiKey = 'sk_live_123456789';
```

Prefer:

```env
PAYMENT_API_KEY=real-key-outside-the-repository
```

```ts
const paymentApiKey = process.env.PAYMENT_API_KEY;

if (!paymentApiKey) {
  throw new Error('PAYMENT_API_KEY is not configured');
}
```

Do not log sensitive values, do not include them in error messages, and never put real keys in examples or documentation.
