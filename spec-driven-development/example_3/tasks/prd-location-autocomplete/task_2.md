# Task 2.0: Implement the autocomplete frontend, integration, and E2E validation

## Overview

Implement the complete flow in the React frontend: debounced suggestion search, accessible combobox, pointer and keyboard selection, structured weather query, recovery states, and E2E tests for critical flows.

<skills>
### Skills compliance

- `react`: apply small components, explicit props, separation between view, components, hooks, and services, effects only for external synchronization, request cleanup, ARIA semantics, visible focus, and responsive Tailwind.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all rules in `.agents/rules/` have been read. The following especially apply:

- keep the `view → components/hooks → services → backend` flow and do not use `fetch` in views or components;
- keep components with a single responsibility, TypeScript files up to 100 lines, and functions up to 30 lines;
- declare props explicitly, avoid mutation, use strict TypeScript, use `unknown` for external responses, and strict comparisons;
- use `useEffect` only for timers, requests, cancellation, or other external synchronization, always with cleanup;
- provide ARIA roles, names, states, and relationships for the combobox and announce loading, empty, and error states;
- use Tailwind CSS with focus, hover, conditional states, and responsiveness without horizontal overflow;
- create automated tests with Testing Library, `user-event`, fake timers, Vitest, and Playwright, maintaining minimum 80% coverage.

No deviations are planned.
</rules>

<requirements>
- RF1 to RF4: search after debounce only with a valid query, update results, and display at most five options.
- RF5: display city, administrative division when available, and country in each suggestion.
- RF6 and RF7: allow selection by mouse, touch, and keyboard; arrows navigate, Enter selects, and Escape closes.
- RF8 and RF9: close the list and start `POST /weather` with the selected location, without silently choosing a namesake.
- RF10 to RF13: communicate loading, empty, and unavailability states, keep the field editable, and ignore stale responses.
- RF14: close the list when clearing, selecting, pressing Escape, or leaving the interaction.
- Keep focus on the field during navigation and communicate the active item with `aria-activedescendant`.
- Maintain readability and operation at 360 px and 1280 px, without depending only on color or icons.
- Adapt the mocks and run lint, typecheck, build, tests, coverage, and Playwright validations.
</requirements>

## Subtasks

- [x] 2.1 Create state types, the locations client, the weather client, and frontend response parsers.
- [x] 2.2 Implement `useLocationSuggestions` with 200 ms debounce, `AbortController`, cleanup, discriminated states, and protection against out-of-order responses.
- [x] 2.3 Implement `useComboboxNavigation`, `LocationAutocomplete`, `LocationSuggestionsList`, and `LocationSuggestionFeedback` with the accessible semantics defined in the TechSpec.
- [x] 2.4 Integrate selection, search pause, and weather query in `WeatherView`, removing `WeatherSearchForm` and preserving the existing result and attribution.
- [x] 2.5 Create unit, component, and integration tests for services, hooks, semantics, keyboard, pointer, feedback, and structured weather submission.
- [x] 2.6 Update the Open-Meteo mock and create Playwright tests for namesakes, keyboard, empty and error states, out-of-order responses, p95, and responsiveness.
- [x] 2.7 Run lint, typecheck, build, tests with minimum 80% frontend coverage, and the E2E suite, fixing identified failures.

## Implementation details

See `techspec.md`, especially “System architecture,” “Implementation design,” “Data models,” “Integration points,” “Testing approach,” “Development sequencing,” and “Skills compliance.” Use the TechSpec as the source of truth for the state machine, HTTP contracts, debounce, cancellation, WAI-ARIA semantics, selection as search pause, messages, and responsive behavior.

## Related acceptance criteria

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13

## Task tests

### Unit tests (if applicable)

- [x] TU-FE-01 — Interprets location success, empty, and error
- [x] TU-FE-02 — Applies debounce and avoids calls below the minimum
- [x] TU-FE-03 — Ignores stale responses
- [x] TU-FE-04 — Exposes combobox semantics
- [x] TU-FE-05 — Navigates and selects by keyboard
- [x] TU-FE-06 — Selects by pointer and closes the list
- [x] TU-FE-07 — Sends structured selection to weather

### Integration tests (if applicable)

- [x] TI-FE-01 — Integrates autocomplete, selection, and weather

### E2E tests (if applicable)

- [x] E2E-01 — Chooses a namesake city by pointer
- [x] E2E-02 — Operates the combobox using keyboard only
- [x] E2E-03 — Handles minimum, empty, and unavailability
- [x] E2E-04 — Keeps only the current query response
- [x] E2E-05 — Measures suggestion p95
- [x] E2E-06 — Keeps autocomplete responsive

## Relevant files

- `tasks/prd-location-autocomplete/prd.md`
- `tasks/prd-location-autocomplete/techspec.md`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/LocationAutocomplete.tsx`
- `frontend/src/components/LocationSuggestionsList.tsx`
- `frontend/src/components/LocationSuggestionFeedback.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/hooks/useLocationSuggestions.ts`
- `frontend/src/hooks/useComboboxNavigation.ts`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/location-service.py`
- `frontend/src/services/weather-service.py`
- `frontend/src/types/location-suggestion.py`
- `frontend/src/types/location-search-state.py`
- `frontend/src/types/api-error.py`
- Tests `*.test.ts` and `*.test.tsx` close to frontend modules
- `frontend/vitest.config.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/real-performance.spec.ts`
- `e2e/playwright.config.ts`
