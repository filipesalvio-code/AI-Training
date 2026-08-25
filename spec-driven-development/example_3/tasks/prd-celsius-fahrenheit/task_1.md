# Task 1.0: Build the temperature conversion foundation and the unit toggle

## Overview

Build the two isolated parts of the feature: the `TemperatureUnit` type, the pure module that converts, rounds, and formats temperatures, and the controlled `TemperatureUnitToggle` component. No existing component is changed in this task, so the current test suite remains green at the end.

<skills>
### Skills compliance

- `execute-task`: use it to drive implementation of this task and check off subtasks as they are completed.
- `react`: must be loaded before creating `TemperatureUnitToggle`, applying a small controlled component, explicit props without spread, no redundant state or effect for derived values, `button` semantics with `aria-pressed`, accessible name, visible focus, and Tailwind utility-based styling.
- `impeccable`: applicable only as a visual reference. The toggle must follow the direction recorded in `DESIGN.md` — amber as the active-state cue, AA contrast, and readability from 360 px — without driving a visual review of the panel.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were considered.

- The change is exclusive to `frontend/`; commands are run inside that directory and no backend file is touched.
- `folder-structure.md`: the new type goes in `src/types/` with one concept per file; the conversion module is not backend access and therefore goes in `src/lib/`, not `src/services/`; the component goes in `src/components/` with its test beside it.
- `code-standards.md`: files under 100 lines, functions under 30 lines, at most three parameters, no comments, no blank lines inside functions, and no magic numbers or strings — the formula, conversion factor, and symbols are stored in named constants in the module.
- `javascript-typescript.md`: `const` by default, strict comparisons, explicit typing for parameters and returns, no `any`, simple non-nested ternary, and no argument mutation.
- `tests.md`: all new code is born covered, following FIRST and AAA, with fast, independent, self-validating tests; this task is unit-based and has no external dependency to replace with mocks.
- Mandatory JavaScript/TypeScript validation: run `npm run lint` in `frontend/` at the end of the task.
- There is no planned deviation from the rules.
</rules>

<requirements>
- Define `TemperatureUnit` as the literal union `'celsius' | 'fahrenheit'`, naming the unit and not the symbol (RF5).
- Implement conversion using the formula `fahrenheit = celsius * 9 / 5 + 32`, rounding only after conversion (RF5).
- Round temperature to the nearest integer in both units, with no decimal places (RF6).
- Normalize `-0` to `0`, so the interface never shows `-0°C` (RF6).
- Concatenate the active unit symbol with no space, producing `24°C` and `76°F` (RF7).
- Centralize in `formatTemperature` the single source of temperature text for the interface (RF5, RF7).
- Expose the toggle as `role="group"` labeled `Temperature unit`, with two `<button type="button">` elements with visible text `°C` and `°F` (RF1).
- Indicate the active unit via `aria-pressed`, contrast, and font weight, never by color alone (RF2).
- Define accessible names `Celsius (°C)` and `Fahrenheit (°F)`, containing the visible text to meet WCAG 2.5.3 criterion (RF14).
- Keep the component controlled, with no internal state, notifying the unit corresponding to the button pressed (RF1, RF10).
- Ensure `Tab` reachability, keyboard activation, and a visible focus indicator in the amber pattern already used in the form (RF13).
- Allow activating the already-active unit without producing any observable effect (RF4).
- Do not introduce a new dependency, request, `useMemo`, context, or any form of persistence (RF9, RF12).
</requirements>

## Subtasks

- [x] 1.1 Create `src/types/temperature-unit.py` with the `TemperatureUnit` type.
- [x] 1.2 Create `src/lib/temperature.ts` with `toFahrenheit`, `getUnitSymbol`, and `formatTemperature`, including rounding and negative-zero normalization.
- [x] 1.3 Create `src/lib/temperature.test.ts` covering formula, rounding, sign, and symbol (TU-01 to TU-04).
- [x] 1.4 Create `src/components/TemperatureUnitToggle.tsx` as a controlled component with accessible semantics and styling aligned with `DESIGN.md`.
- [x] 1.5 Create `src/components/TemperatureUnitToggle.test.tsx` covering active state, accessible name, activation, keyboard use, and selecting the already-active unit (TU-05 to TU-08).
- [x] 1.6 Run `npm run lint`, `npm run typecheck`, and `npm test` in `frontend/` and confirm the existing suite remains green.

## Implementation details

Follow `techspec.md`, especially “Key interfaces,” “Data models” — particularly the `TemperatureUnit` and `TemperatureUnitToggleProps` tables, “Fixed conversion and formatting rules,” and “Accessible semantics of the toggle” — the “Key decisions” items about pure module, `aria-pressed`, and rounding after conversion, and the risks of negative zero, WCAG 2.5.3, and duplicated formatting.

## Related acceptance criteria

- CA-01
- CA-03
- CA-04
- CA-11
- CA-12

## Task tests

### Unit tests

- [x] TU-01 — Converts Celsius to Fahrenheit for the specified values
- [x] TU-02 — Rounds to the nearest integer in both units
- [x] TU-03 — Normalizes negative zero in formatting
- [x] TU-04 — Concatenates the active unit symbol
- [x] TU-05 — Toggle exposes the active unit through state and accessible name
- [x] TU-06 — Toggle notifies the selected unit when activated
- [x] TU-07 — Toggle is keyboard-operable with visible focus
- [x] TU-08 — Selecting the already-active unit keeps the display unchanged

## Relevant files

- `frontend/src/types/temperature-unit.py`
- `frontend/src/lib/temperature.ts`
- `frontend/src/lib/temperature.test.ts`
- `frontend/src/components/TemperatureUnitToggle.tsx`
- `frontend/src/components/TemperatureUnitToggle.test.tsx`
- `DESIGN.md`
- `tasks/prd-celsius-fahrenheit/techspec.md`
