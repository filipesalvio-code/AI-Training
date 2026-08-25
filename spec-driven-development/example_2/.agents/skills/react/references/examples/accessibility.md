# Accessibility examples

## Loading message

```tsx
function LoadingMessage() {
  return (
    <p role="status" aria-live="polite" aria-busy="true">
      Querying the API...
    </p>
  )
}
```
