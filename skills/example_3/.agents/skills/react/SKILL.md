---
name: react
description: Patterns for implementing, reviewing, and refactoring React 19 with TypeScript in this project, including components, props, hooks, effects, memoization, backend integration, accessibility, and Tailwind CSS. Use when working on frontend React files, creating or changing components and hooks, reviewing state and effects, or assessing React UI quality.
---

# React rules

These rules apply to this project's React frontend code.

## How to use this skill

Apply these rules when creating, changing, or reviewing React code. Load the examples only when needed:

- [Small components and explicit props](references/examples/components.md)
- [Hooks, effects, and memoization](references/examples/hooks-effects.md)
- [Backend access](references/examples/backend.md)
- [Accessibility](references/examples/accessibility.md)
- [Styling](references/examples/styling.md)
- [10 additional React best practices](references/react-best-practices.md)

## Small, reusable components

- Create components with a single responsibility.
- Do not create components longer than 30 lines. Extract UI parts, business rules, or state into smaller components and hooks.
- Prefer names that express the component's role, such as `StatusCard`, `HealthMessage`, and `LoadingIndicator`.
- Reuse components for common behaviors and visual structures to avoid duplication.

See the [small components and explicit props examples](references/examples/components.md).

## Explicit props

Avoid forwarding props with the spread operator, because that hides the component API and can pass unexpected attributes.

Declare and use properties explicitly.

See the [explicit props examples](references/examples/components.md).

## Hooks and effects

- Prefer function components.
- Create custom hooks with the `use` prefix, such as `useApiHealth` or `useUsers`.
- Use `useEffect` only to synchronize React with external systems, such as requests, subscriptions, timers, or browser APIs.
- Do not use `useEffect` to compute derived values, respond to click events, or keep state that can be obtained directly from props and existing state.

See the [hooks, effects, and memoization examples](references/examples/hooks-effects.md).

## Memoization

Use `useMemo` to avoid truly expensive calculations across re-renders. Dependencies must represent every value used in the calculation. Do not use `useMemo` for simple operations, because that adds complexity without a meaningful benefit.

See the [memoization examples](references/examples/hooks-effects.md).

## Backend access

- Keep backend access out of the component's visual code.
- Put HTTP calls and response transformation in dedicated modules, such as `src/lib/api/health.ts`.
- Encapsulate loading, success, and error in custom hooks.
- The component should consume the hook state and handle only presentation and interactions.

See the [backend access examples](references/examples/backend.md).

## Accessibility

- Always provide `aria-*` accessibility properties appropriate to the element and the presented state.
- Prefer semantic elements (`button`, `nav`, `main`, `section`, `form`) and complement them with `aria-label`, `aria-live`, `aria-busy`, `aria-expanded`, or `aria-pressed` when applicable.
- Interactive controls must indicate their state and have an accessible name.
- Asynchronous, loading, or error messages must be announced when needed.

See the [accessibility examples](references/examples/accessibility.md).

## Styling

- Use Tailwind CSS to style components.
- Prefer utility classes directly in JSX and clear conditional variants.
- Avoid inline CSS and component-specific stylesheets when Tailwind classes cover the case.
- Keep component-related classes close to its structure and ensure focus, hover, disabled, and responsive states.

See the [styling examples](references/examples/styling.md).

## Additional best practices

Also apply the [10 additional React best practices](references/react-best-practices.md), especially component purity, Rules of Hooks, immutability, stable keys, state modeling, state sharing, functional updaters, effect cleanup, conscious state preservation, and careful use of reducers.
