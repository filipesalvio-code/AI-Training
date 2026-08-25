# React rules

These rules apply to the React frontend in this project.

## Small, reusable components

- Create components with a single responsibility.
- Do not create components longer than 30 lines. Extract UI pieces, business rules, or state into smaller components and hooks.
- Prefer names that express the component's role, such as `StatusCard`, `HealthMessage`, and `LoadingIndicator`.
- Reuse components for common behaviors and visual structures to avoid duplication.

Example of a small component:

```tsx
type StatusCardProps = {
  status: 'online' | 'offline'
}

export function StatusCard({ status }: StatusCardProps) {
  const label = status === 'online' ? 'API online' : 'API offline'
  const color = status === 'online' ? 'text-green-700' : 'text-red-700'

  return (
    <section aria-label="API status" className="rounded-lg border p-4">
      <p className={color}>{label}</p>
    </section>
  )
}
```

## Explicit props

Avoid forwarding props with the spread operator, because that hides the component API and can pass unexpected attributes:

```tsx
// Avoid
function Button(props: ButtonProps) {
  return <button {...props} />
}
```

Declare and use properties explicitly:

```tsx
type ButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {label}
    </button>
  )
}
```

## Hooks and effects

- Prefer function components.
- Create custom hooks with the `use` prefix, such as `useApiHealth` or `useUsers`.
- Use `useEffect` only to synchronize React with external systems, such as requests, subscriptions, timers, or browser APIs.
- Do not use `useEffect` to compute derived values, respond to click events, or keep state that can be derived from props and existing state.

Avoid an unnecessary effect:

```tsx
// Avoid: the value can be computed during render
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])
```

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`
```

## Memoization

Use `useMemo` to avoid truly expensive calculations across re-renders. Dependencies must include every value used in the calculation. Do not use `useMemo` for simple operations, because that adds complexity without meaningful benefit.

```tsx
const filteredUsers = useMemo(
  () => users.filter((user) => user.name.includes(searchTerm)),
  [users, searchTerm],
)
```

## Backend access

- Keep backend access out of visual component code.
- Put HTTP calls and response mapping in dedicated modules, such as `src/lib/api/health.ts`.
- Encapsulate loading, success, and error in custom hooks.
- The component should consume the hook state and handle only presentation and interactions.

Example API access module:

```ts
export type Health = { status: string }

export async function fetchHealth(): Promise<Health> {
  const response = await fetch('http://localhost:3000/health')
  if (!response.ok) throw new Error('Could not query the API')
  return response.json() as Promise<Health>
}
```

Example hook that holds integration logic:

```tsx
export function useApiHealth() {
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .finally(() => setLoading(false))
  }, [])

  return { health, loading }
}
```

## Accessibility

- Always provide `aria-*` properties appropriate to the element and presented state.
- Prefer semantic elements (`button`, `nav`, `main`, `section`, `form`) and complement them with `aria-label`, `aria-live`, `aria-busy`, `aria-expanded`, or `aria-pressed` when applicable.
- Interactive controls must indicate their state and have an accessible name.
- Async, loading, or error messages should be announced when needed.

```tsx
function LoadingMessage() {
  return (
    <p role="status" aria-live="polite" aria-busy="true">
      Querying the API...
    </p>
  )
}
```

## Styling

- Use Tailwind CSS to style components.
- Prefer utility classes directly in JSX with clear conditional variants.
- Avoid inline CSS and one-off stylesheets when Tailwind classes cover the case.
- Keep classes close to the component structure and ensure focus, hover, disabled, and responsive states.

```tsx
<button
  type="button"
  aria-label="Refresh status"
  className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Refresh
</button>
```
