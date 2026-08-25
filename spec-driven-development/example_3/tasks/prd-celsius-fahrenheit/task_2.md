# Task 2.0: Integrate unit switching into the panel and validate end-to-end

## Overview

Connect the foundation created in task 1 to the panel: `WeatherResult` now formats temperature and apparent temperature based on the selected unit and renders the toggle, and `WeatherView` now keeps this unit in component state. This task focuses on the rounding change and, with it, updating the existing tests that currently assert values with decimal places, plus the new E2E case and final validations.

<skills>
### Skills compliance

- `execute-task`: use it to drive the implementation of this task, which depends on completing task 1.
- `react`: must be loaded before changing `WeatherResult` and `WeatherView`, applying lifted state to the lowest common ancestor, explicit props without spread, no `useEffect` for derived values, no premature memoization, and preserving the existing accessible semantics.
- `execute-qa`: use it in final validation and stabilization against the PRD, TechSpec, and tasks, recording evidence in `tasks/prd-celsius-fahrenheit/evidences/`.
- `impeccable`: applicable only as visual reference, ensuring the toggle next to the highlighted value preserves the hierarchy, contrast, and responsiveness described in `DESIGN.md`.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were considered.

- The change is limited to `frontend/` and `e2e/`; no backend file is touched and no `package.json` is created at the root.
- `folder-structure.md`: the `view → components` flow is preserved; unit state lives in the view and flows down via props, and the result still has no HTTP access.
- `code-standards.md`: files under 100 lines, functions and components under 30 lines, at most three parameters, no comments, and no blank lines inside functions, maintaining the dense style already used in existing components.
- `javascript-typescript.md`: explicit prop typing, `const` by default, strict comparisons, prohibition of `any`, and no mutation of payload received from the backend.
- `tests.md`: keep the pyramid with a broad unit base, four integration cases, and a single E2E case; tests independent, repeatable, and self-validating; minimum 80% coverage respected; selectors by roles and accessible names, without coupling to style classes.
- E2E tests remain in `e2e/`, outside `frontend/` and `backend/`.
- Mandatory final validations: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` in `frontend/`, plus the `e2e/` suite.
- There is no planned deviation from the rules.
</rules>

<requirements>
- Change `WeatherResult` to receive `unit` and `onUnitChange` and format temperature and apparent temperature exclusively with `formatTemperature` (RF5, RF6, RF7).
- Derive the displayed symbol from the selected unit, no longer using `units.temperature` and `units.apparentTemperature` from the payload in the display (RF7).
- Keep relative humidity in `%` and wind speed in `km/h` for any temperature unit, also preserving location, condition, and attribution (RF8).
- Render the toggle next to the highlighted value, inside the result block, so it does not exist in the initial, loading, and error states (RF1, RF3).
- Keep the unit in `useState` in `WeatherView`, always starting in `celsius` and persisting across subsequent searches within the same page session (RF10, RF11).
- Do not store the preference in `localStorage`, `sessionStorage`, cookies, or backend (RF12).
- Ensure switching does not trigger a request, does not change the API contract, and does not show a loading state (RF9).
- Update `WeatherResult.test.tsx` and case `E2E-01` to rounded values `24°C` and `25°C`, keeping `72%` and `12.4km/h` unchanged.
- Extend `E2E-08` to capture evidence at 360 px and 1280 px with the toggle visible, without creating an additional E2E case.
- Add `E2E-10` verifying keyboard switching, absence of request to `/weather?city=`, persistence of choice in a new search, and return to Celsius after `reload`.
- Record in `tasks/prd-celsius-fahrenheit/evidences/` the Fahrenheit result capture and the 360 px and 1280 px captures.
- Finish with all `frontend/` and `e2e/` validations passing and minimum 80% coverage maintained.
</requirements>

## Subtasks

- [x] 2.1 Change `src/components/WeatherResult.tsx` to receive the unit, format via the pure module, and render the toggle next to the highlighted value.
- [x] 2.2 Update `src/components/WeatherResult.test.tsx` for whole-number rounding and add coverage for Fahrenheit display and preserved metric measures (TU-09 to TU-11).
- [x] 2.3 Change `src/views/WeatherView.tsx` to keep the unit in state and pass it to the result.
- [x] 2.4 Extend `src/views/WeatherView.test.tsx` with the four integration cases for control absence, network isolation, persistence between searches, and return to default (TI-01 to TI-04).
- [x] 2.5 Update `E2E-01` for rounded values and extend `E2E-08` to record evidence with the toggle visible.
- [x] 2.6 Implement `E2E-10` in `e2e/weather-panel.spec.ts` and save evidence of the Fahrenheit result.
- [x] 2.7 Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` in `frontend/`, and the `e2e/` suite with backend and mock active.

## Implementation details

Follow `techspec.md`, especially “Component view”, “`WeatherResponse` → display mapping”, `WeatherResultProps`, the note on selecting the already active unit, “Testing approach” with cases TU-09 to TU-11, TI-01 to TI-04, and E2E-10, “Development sequencing” — where updating existing tests is a blocker for changing the component — and the risks around rounding changes, focus order, and duplicate formatting. The reference values from mock `e2e/mock-open-meteo.mjs` are `24.3 °C` and `25.1 °C`, displayed as `24°C`/`25°C` in Celsius and `76°F`/`77°F` in Fahrenheit.

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

### Unit tests

- [x] TU-09 — Result displays temperature and apparent temperature in the chosen unit
- [x] TU-10 — Result keeps humidity and metric wind speed in Fahrenheit
- [x] TU-11 — Result in Celsius displays the full rounded reading

### Integration tests

- [x] TI-01 — Toggle absent without a visible result
- [x] TI-02 — Unit switch does not trigger a request and preserves the result
- [x] TI-03 — Chosen unit persists in the next search
- [x] TI-04 — New view mount starts in Celsius

### E2E tests

- [x] E2E-10 — Switches unit without network, preserves choice between searches, and returns to Celsius after reloading

## Relevant files

- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/views/WeatherView.test.tsx`
- `e2e/weather-panel.spec.ts`
- `e2e/mock-open-meteo.mjs` (reference, no changes)
- `tasks/prd-celsius-fahrenheit/evidences/`
- `tasks/prd-celsius-fahrenheit/techspec.md`
