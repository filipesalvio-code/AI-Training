# 10 additional React best practices

These practices complement the skill's original rules. They were consolidated from the official React documentation, consulted on August 2, 2026.

## Index

1. [Keep components and Hooks pure](#1-keep-components-and-hooks-pure)
2. [Follow the Rules of Hooks](#2-follow-the-rules-of-hooks)
3. [Treat props and state as immutable](#3-treat-props-and-state-as-immutable)
4. [Use stable keys in lists](#4-use-stable-keys-in-lists)
5. [Model state without redundancy](#5-model-state-without-redundancy)
6. [Keep a single source of truth](#6-keep-a-single-source-of-truth)
7. [Use functional updaters when needed](#7-use-functional-updaters-when-needed)
8. [Clean up effects and protect asynchronous requests](#8-clean-up-effects-and-protect-asynchronous-requests)
9. [Consciously control state preservation](#9-consciously-control-state-preservation)
10. [Extract complex logic into pure reducers](#10-extract-complex-logic-into-pure-reducers)

## 1. Keep components and Hooks pure

Make components and Hooks idempotent: with the same inputs, produce the same result. Do not run side effects during render or mutate non-local values. Put mutations and effects in event handlers or Effects, according to what causes the operation.

Source: [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure).

## 2. Follow the Rules of Hooks

Call Hooks only at the top level of function components or custom Hooks. Do not call them inside conditions, loops, nested functions, handlers, `try`/`catch`/`finally`, or after a conditional return. Keep `eslint-plugin-react-hooks` enabled to detect violations.

Source: [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).

## 3. Treat props and state as immutable

Do not mutate props, state, or objects and arrays stored in state directly. Create a new reference and pass it to the setter. For nested structures, copy each level needed until the changed value.

Source: [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) and [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state).

## 4. Use stable keys in lists

When rendering lists, use a stable, unique `key` derived from the item's identity. Avoid array indexes when the list can be reordered, inserted into, or removed from, and never generate keys during render with `Math.random()` or equivalent values. Do not expect to receive `key` as a prop: pass another prop name when the component also needs the identifier.

Source: [Rendering Lists](https://react.dev/learn/rendering-lists).

## 5. Model state without redundancy

Keep in state only the data that needs to be remembered across renders. Avoid derived, contradictory, or duplicated state; compute information from props and existing state during render. Prefer shallow structures when that makes updates clearer.

Source: [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure).

## 6. Keep a single source of truth

When components need to coordinate the same data, keep the state in the nearest common ancestor and pass value and handlers via props. For each piece of information, define a single owner component. Use controlled components when the parent needs to determine the child's behavior.

Source: [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components).

## 7. Use functional updaters when needed

When the next state depends on the previous state, use the functional form of the setter, such as `setCount((count) => count + 1)`. This is especially important when several updates are queued in the same event or when an update happens asynchronously.

Source: [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates).

## 8. Clean up effects and protect asynchronous requests

Every Effect that creates a subscription, timer, connection, or other external resource must return a cleanup that undoes that setup. In asynchronously started requests, abort the request or ignore stale results to avoid race conditions and state updates from a previous operation.

Source: [useEffect](https://react.dev/reference/react/useEffect) and [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).

## 9. Consciously control state preservation

Remember that React associates state with a component's position in the render tree. Preserve state by keeping structural identity; when a switch represents a different entity and requires a reset, provide a different `key` for the appropriate subtree.

Source: [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).

## 10. Extract complex logic into pure reducers

When many handlers update the same complex state, centralize the transitions in a pure reducer function and use `useReducer`. Make each action represent a meaningful interaction or event, keep effects out of the reducer, and return new objects or arrays without mutation.

Source: [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer).
