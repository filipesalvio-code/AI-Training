# Task 3.0: Implement the HTTP service and the frontend state machine

## Overview

Prepare the frontend integration layer with the backend and implement a single source of truth for the `idle`, `loading`, `success`, and `error` states, including immediate validation, prevention of duplicate submissions, and recovery after failures.

<skills>
### Skill compliance

- `execute-task`: use it to implement this task after completing task 2.
- `react`: mandatory loading before creating or changing the hook, React tests, and any frontend integration; fully follow its rules and references.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were taken into account.

- Run dependencies and commands inside `frontend/` and preserve its independent lockfile.
- Keep the flow `view → components/hooks → services → backend`; only the service may know the URL and HTTP contract.
- Use explicit types in their own files, never `any`, and validate external data before treating it as internal contracts.
- Keep minimal, non-redundant state, immutable updates, and effects only for synchronization or cleanup of external boundaries.
- Ignore stale responses after unmounting and do not update state of an unmounted component.
- Cover all code with Vitest and Testing Library, using observable behavior and controlled dependencies.
- Run lint, typecheck, build, tests, and coverage before completing the task.
- There is no planned deviation from the rules.
</rules>

<requirements>
- RF2: validate on the frontend the same city rule as the backend, guide the user, and do not start an invalid request.
- RF7: use exclusively `GET /weather` on the backend, with no knowledge of or calls to Open-Meteo domains.
- RF13: represent loading and prevent a second submission from starting another query while the current one is pending.
- RF14 and RF15: map city not found and unavailability to actionable messages and allow retry.
- RF16: clear the previous result when starting a search and keep it absent when the new attempt fails.
- Configure `VITE_API_BASE_URL` per environment, document it in `.env.example`, and avoid hardcoding an environment-specific URL in code.
- Encapsulate the HTTP contract, error envelope parsing, and `AbortSignal` usage in `weather-service.ts`.
- Keep a discriminated state machine to prevent contradictory combinations of result, loading, and error.
- Configure Vitest, jsdom, Testing Library, `user-event`, `jest-dom`, V8 coverage, and frontend test scripts.
</requirements>

## Subtasks

- [x] 3.1 Add frontend testing dependencies, update the lockfile, and configure environment, setup, scripts, and coverage thresholds.
- [x] 3.2 Define in dedicated files the response, error, and discriminated search state types.
- [x] 3.3 Implement the HTTP service as the only access boundary to `GET /weather`.
- [x] 3.4 Implement `useWeatherSearch` with validation, state transitions, duplicate blocking, result clearing, and safe cancellation.
- [x] 3.5 Implement the four planned unit cases using a minimal harness and queries by accessible semantics when there is test UI.
- [x] 3.6 Run frontend lint, typecheck, build, tests, and coverage.

## Implementation details

Follow `techspec.md`, especially “Component view,” “Main interfaces,” `WeatherResponse`, `ApiError`, “Testing approach,” “Development sequencing,” and the decisions about validation on both sides. The visual composition of the panel remains for task 4.

## Related acceptance criteria

- CA-05
- CA-06
- CA-07
- CA-08

## Task tests

### Unit tests

- [ ] TU-FE-01 — Validates the city before calling the service
- [ ] TU-FE-02 — Models loading and blocks duplicate submission
- [ ] TU-FE-04 — Shows city not found and allows retry
- [ ] TU-FE-05 — Clears previous result after external failure

## Relevant files

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`
- `frontend/vitest.config.ts`
- `frontend/.env.example`
- `frontend/src/test/setup.ts`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.py`
- `frontend/src/types/weather-response.py`
- `frontend/src/types/api-error.py`
- `frontend/src/types/weather-search-state.py`
- Tests `*.test.ts` and `*.test.tsx` next to their corresponding modules
