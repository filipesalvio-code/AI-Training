# Component and props examples

## Small component example:

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

## Explicit props example

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
