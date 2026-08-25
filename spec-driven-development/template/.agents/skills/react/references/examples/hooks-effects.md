# Hooks, effects, and memoization examples

## Avoid an unnecessary effect:

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

```tsx
const filteredUsers = useMemo(
  () => users.filter((user) => user.name.includes(searchTerm)),
  [users, searchTerm],
)
```
