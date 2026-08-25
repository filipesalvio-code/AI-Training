# Technical specification

## Summary

The feature described in [`prd.md`](./prd.md) will be implemented entirely on the frontend, as a display preference. The backend, the `GET /weather` contract, and the `WeatherResponse` type remain unchanged: the payload stays in degrees Celsius, and conversion happens at render time. A pure module will convert and format temperature values, a new component will expose the `°C`/`°F` toggle, and `WeatherView` will keep the selected unit in component state, which preserves it across searches and discards it on page reload, meeting CA-07 and CA-08 without any form of persistence.

Two decisions change existing behavior and were confirmed with the user. First: temperature and apparent temperature will now be displayed rounded to whole numbers in both units, according to RF6 and CA-03, replacing the current one-decimal display — this requires updating `WeatherResult.test.tsx` and case `E2E-01`. Second: the displayed symbol will now derive from the selected unit, rather than from the payload’s `units.temperature` field, which continues to govern only `%` and `km/h`. No new dependencies will be added, no additional requests will be made, and no backend files will be touched.

## System architecture

### Component overview

Main flow:

```text
WeatherView (unit state)
  → WeatherResult (weather, unit, onUnitChange)
    → TemperatureUnitToggle (unit, onUnitChange)
    → formatTemperature(celsius, unit)  [pure module, no React]
```

New frontend components:

- `src/types/temperature-unit.py` — will define `TemperatureUnit`, keeping one type per file according to the project's folder structure.
- `src/lib/temperature.py` — pure module, without React and without I/O, responsible for conversion, rounding, and formatting with symbol.
- `src/components/TemperatureUnitToggle.tsx` — labeled group with two buttons that expose the active unit via `aria-pressed`.

Modified frontend components:

- `src/views/WeatherView.tsx` — will now keep `unit` in `useState` and pass it down to the result. This is the correct boundary because the view survives search changes, while the result is recreated on each query.
- `src/components/WeatherResult.tsx` — will receive `unit` and `onUnitChange`, format temperature and apparent temperature through the pure module, and render the toggle next to the highlighted value.

Relationships and boundaries:

- The `lib/temperature.ts` module does not import React, components, or services; it is called only by the presentation layer.
- `TemperatureUnitToggle` is controlled: it has no internal state and only notifies selections.
- `WeatherResult` still has no HTTP access; the toggle lives inside it because RF3 requires it to exist only when there is a result.
- `useWeatherSearch` and `weather-service` are unchanged: unit does not participate in the request, which guarantees CA-05 by construction.
- No component reads or writes `localStorage`, `sessionStorage`, or cookies, according to RF12.

## Implementation design

### Main interfaces

```text
temperature (pure module)
  toFahrenheit(celsius) -> number
  formatTemperature(celsius, unit) -> string
  getUnitSymbol(unit) -> '°C' | '°F'
```

```text
TemperatureUnitToggle
  props: { unit, onUnitChange }

WeatherResult
  props: { weather, unit, onUnitChange }
```

`formatTemperature` is the only function allowed to produce temperature text in the interface. It converts when the unit is `fahrenheit`, rounds to the nearest integer, normalizes `-0` to `0`, and concatenates the symbol without a space, preserving the current visual pattern (`24°C`). The calculation is trivial and will not be memoized.

### Data models

There is no persisted entity and no HTTP contract change. The models below describe the new type, the props of affected components, and the deterministic conversion and formatting rules.

#### `TemperatureUnit` — selected display unit

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `TemperatureUnit` | `'celsius' \| 'fahrenheit'` | yes | Literal union used throughout the presentation layer. The initial value is always `'celsius'`. |

```text
"celsius"
```

> **Domain choice:** the type names the unit (`celsius`), not the symbol (`°C`), to separate user preference from displayed text and avoid coupling comparisons to presentation characters.

#### `TemperatureUnitToggleProps` — toggle contract

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `unit` | `TemperatureUnit` | yes | Active unit, reflected in `aria-pressed`. |
| `onUnitChange` | `(unit: TemperatureUnit) => void` | yes | Notifies the unit corresponding to the pressed button. |

```text
{
  "unit": "celsius",
  "onUnitChange": "(unit) => void"
}
```

#### `WeatherResultProps` — result contract

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `weather` | `WeatherResponse` | yes | Existing backend payload, always in degrees Celsius. |
| `unit` | `TemperatureUnit` | yes | Unit applied to temperature and apparent temperature. |
| `onUnitChange` | `(unit: TemperatureUnit) => void` | yes | Forwarded to the toggle. |

```text
{
  "weather": "WeatherResponse",
  "unit": "fahrenheit",
  "onUnitChange": "(unit) => void"
}
```

#### `WeatherResponse` → display mapping

| Source (payload in °C) | Destination (display) | Rule |
| --- | --- | --- |
| `current.temperature` | highlighted value | `formatTemperature(valor, unit)` |
| `current.apparentTemperature` | “Feels like” line | `formatTemperature(valor, unit)` |
| `units.temperature` | — | No longer used in display; symbol comes from `unit`. |
| `units.apparentTemperature` | — | No longer used in display; symbol comes from `unit`. |
| `current.relativeHumidity` + `units.relativeHumidity` | “Relative humidity” line | Unchanged, always `%`. |
| `current.windSpeed` + `units.windSpeed` | “Wind speed” line | Unchanged, always `km/h`. |
| `current.condition`, `location.*`, `source.*` | unchanged | Unit switching does not affect them. |

#### Fixed conversion and formatting rules

| Rule | Definition |
| --- | --- |
| Formula | `fahrenheit = celsius * 9 / 5 + 32` |
| Rounding | `Math.round` on the already converted value, never on the original value |
| Half units | `Math.round` rounds up (`-17.5` → `-17`) |
| Negative zero | `-0` is normalized to `0`, avoiding display of `-0°C` |
| Symbol | `celsius` → `°C`; `fahrenheit` → `°F`, concatenated without space |
| Decimal places | None, in both units |

Verifiable examples, including the values used by the E2E mock:

| Source (°C) | Display in °C | Display in °F |
| --- | --- | --- |
| `0` | `0°C` | `32°F` |
| `23` | `23°C` | `73°F` |
| `-5` | `-5°C` | `23°F` |
| `24.3` | `24°C` | `76°F` |
| `25.1` | `25°C` | `77°F` |
| `-0.4` | `0°C` | `32°F` |

#### Accessible semantics of the toggle

| Element | Definition |
| --- | --- |
| Container | `role="group"` with `aria-label="Unidade de temperatura"` |
| Buttons | Two `<button type="button">`, visible text `°C` and `°F` |
| Accessible name | `aria-label="Celsius (°C)"` and `aria-label="Fahrenheit (°F)"`, containing visible text to meet WCAG 2.5.3 (Label in Name) criterion |
| State | `aria-pressed={true}` on the active unit button and `false` on the other |
| Focus | Visible focus ring reusing the amber pattern already used in the form |
| Visual indication | Background contrast and text weight, in addition to `aria-pressed`; color is never the only indicator |

> **Selecting the already active unit:** the button remains actionable and calls `onUnitChange` with the same value. React’s `useState` discards the update when the value is identical, so no displayed value changes, satisfying RF4 and CA-12 without additional conditional logic.

There is no database schema, cache, or local storage. The preference exists only in component memory while the page remains open.

### API endpoints (if applicable)

Not applicable. The feature does not expose, change, or consume any new endpoint. `GET /weather` and `GET /health` remain exactly as specified in the [Weather panel TechSpec](../prd-weather-panel/techspec.md), and no request is triggered by changing the unit.

## Integration points

Not applicable. There is no new external integration, new authentication, or new error handling. Open-Meteo continues to be queried only by the backend during search, and local conversion introduces no failure modes: the pure module operates on numbers already validated by the backend and present in success state.

## Testing approach

Vitest will cover unit and integration on the frontend, with the 80% thresholds already configured in `frontend/vitest.config.ts`. Playwright will cover a single E2E flow, as decided with the user. Tests will query by roles and accessible names, without coupling to style classes, and will follow FIRST and AAA. No test for this feature needs network: the module is pure and unit switching makes no requests.

In addition to new cases, two existing tests will be updated due to the rounding change: `WeatherResult.test.tsx`, which currently asserts `24.3°C` and `25.1°C`, and `E2E-01`, which asserts those same values against the mock. After the update, both will assert `24°C` and `25°C`, and the other metrics (`72%` and `12.4km/h`) remain unchanged.
### Unit tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TU-01 | Converts Celsius to Fahrenheit for the specified values | CA-03 | `0`, `23`, and `-5` produce `32°F`, `73°F`, and `23°F`. |
| TU-02 | Rounds to the nearest integer in both units | CA-01, CA-03 | `24.3` produces `24°C` and `76°F`; `25.1` produces `25°C` and `77°F`. |
| TU-03 | Normalizes negative zero in formatting | CA-01 | `-0.4` produces `0°C`, and never `-0°C`. |
| TU-04 | Concatenates the active unit symbol | CA-01, CA-02 | The output ends in `°C` or `°F` according to the received unit, with no space. |
| TU-05 | Toggle exposes the active unit through state and accessible name | CA-04 | The active unit button has `aria-pressed="true"`, the other `false`, and both have an accessible name containing the visible symbol. |
| TU-06 | Toggle notifies the selected unit when triggered | CA-01 | Triggering `°F` calls `onUnitChange` with `'fahrenheit'`. |
| TU-07 | Toggle is keyboard-operable with visible focus | CA-11 | The group is reachable via `Tab` and keyboard activation triggers the switch. |
| TU-08 | Selecting the already active unit keeps the display unchanged | CA-12 | No displayed value changes after triggering the active unit again. |
| TU-09 | Result displays temperature and feels-like in the selected unit | CA-01, CA-02 | With `unit='fahrenheit'`, both values appear in `°F` and no value in `°C` remains visible. |
| TU-10 | Result keeps humidity and wind metric in Fahrenheit | CA-09 | `72%` and `12.4km/h` remain visible with `unit='fahrenheit'`. |
| TU-11 | Celsius result shows the full rounded reading | CA-01, CA-13 | Regression of the existing component: `24°C`, `25°C`, `72%`, `12.4km/h`, and attribution links remain visible. |

The `lib/temperature.ts` module will be tested in isolation, without rendering, covering formula, rounding, sign, and symbol. `TemperatureUnitToggle` and `WeatherResult` will be tested with Testing Library and `user-event`. There is no external dependency to mock at this layer.

### Integration tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TI-01 | Toggle absent when no result is visible | CA-10 | In the initial, loading, and error states, the `Temperature unit` group does not exist in the document. |
| TI-02 | Unit switch does not trigger a request and preserves the result | CA-05, CA-06 | After a success, triggering `°F` does not increase `fetch` calls, keeps location, condition, and attribution, and does not show a loading state. |
| TI-03 | Selected unit remains on the next search | CA-07 | With `°F` active, a new successful query is displayed in Fahrenheit without additional interaction with the toggle. |
| TI-04 | New view mount starts in Celsius | CA-08 | A new render of `WeatherView` displays the result in `°C` with `°C` marked as active. |

Integration tests will render the full `WeatherView` and mock only `fetch` at the service boundary, following the pattern already used in `WeatherView.test.tsx`. TI-04 verifies behavior equivalent to a page reload, which in the test environment corresponds to a fresh mount with no preserved state.

### E2E tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| E2E-10 | Switches units without network, preserves choice between searches, and returns to Celsius after reload | CA-05, CA-07, CA-08, CA-11 | After a query, triggering `°F` via keyboard shows `76°F` and `77°F` with no request to `/weather?city=`; a new query remains in Fahrenheit; after `reload`, a query shows `24°C` again. |

The case will reuse the mock in `e2e/mock-open-meteo.mjs`, which already returns `24.3 °C` and `25.1 °C`, and will count requests to `/weather?city=` using the same pattern as `E2E-02` and `E2E-03`. Case `E2E-08`, which validates 360 px and 1280 px, will be extended to capture evidence with the toggle visible, covering CA-13 without creating an additional E2E test. A screenshot of the Fahrenheit result will be saved in `tasks/prd-celsius-fahrenheit/evidences/`.

## Development sequencing

### Build order

1. Create `types/temperature-unit.ts` and `lib/temperature.ts` with their unit tests. The pure foundation locks in formula, rounding, and symbol before any interface depends on them.
2. Create `TemperatureUnitToggle` with tests for accessible state, activation, and keyboard behavior. The component is controlled and can be validated without the result.
3. Change `WeatherResult` to receive `unit` and `onUnitChange`, format using the pure module, and render the toggle; update `WeatherResult.test.tsx`, which will then reflect integer rounding.
4. Lift state into `WeatherView` and cover the four integration cases, including the absence of the toggle in no-result states.
5. Update `E2E-01` for rounded values, extend `E2E-08`, and add `E2E-10`.
6. Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` in `frontend/`, and the `e2e/` suite with backend and mock running.

### Technical dependencies

- No new dependencies, no lock file changes, and no additional environment variables.
- No changes in `backend/`; the E2E suite still requires backend and `mock-open-meteo.mjs` running, as already configured in `e2e/playwright.config.ts`.
- The 80% coverage thresholds already configured in `frontend/vitest.config.ts` remain valid and must continue to be met.
- Updating `WeatherResult.test.tsx` and `E2E-01` is a blocker for step 3: until it is done, the suite will fail by asserting values with decimal places.

## Monitoring and observability

The feature does not introduce server events, metrics, or health checks. The switch is local to the browser, does not generate requests, and therefore does not appear in backend logs — which is intentional and verified by TI-02 and E2E-10. `GET /health` and events `weather_query_completed`, `weather_provider_failed`, and `unexpected_error` remain unchanged. Unit preference is not logged, as it is interaction data with no operational value and there is no client-side collection in this project.

## Technical considerations

### Key decisions

- **Conversion in the presentation layer:** keeps backend, contract, and result cache untouched, satisfies the request for a simple solution, and guarantees CA-05 by design, since there is no unit parameter to send. The alternative of sending unit to the backend was discarded for changing the contract with no benefit.
- **Pure module without React:** conversion, rounding, and symbol are testable without rendering, making most coverage fast and deterministic.
- **State in the view, via props:** `WeatherView` survives between searches and is discarded on reload, producing exactly CA-07 and CA-08 without persistence. Context was discarded as overkill for a single result block; a dedicated hook was discarded for adding indirection to a single value.
- **`aria-pressed` on two buttons:** expresses two mutually exclusive options with minimal markup, keeps both units readable at all times, and is queryable via `getByRole('button', { pressed: true })`. `radiogroup` was discarded due to unnecessary markup and arrow-key navigation; `<select>` was discarded because it requires opening a list for a binary choice.
- **Symbol derived from selected unit:** `units.temperature` in the payload describes the data origin, not display preference, and continues to govern `%` and `km/h`. Using the payload for the symbol would display `°C` next to a converted value.
- **Integer rounding in both units:** decision confirmed by the user, applying RF6 and CA-03. It keeps reading consistent across scales and avoids false precision in an environmental measurement; the cost is changing the current Celsius display and two existing tests.
- **Round after conversion:** rounding before would introduce an error of up to half a degree Celsius, amplified by 1.8 in conversion.
- **No memoization:** one multiplication and one rounding per render do not justify `useMemo`, according to the `react` skill.

### Known risks

- The rounding change alters already delivered behavior and breaks existing tests if applied in isolation. Mitigation: update `WeatherResult.test.tsx` and `E2E-01` in the same step as the component change, as defined in sequencing.
- Values between `-0.5` and `0` would produce `-0°C` without explicit handling. Mitigation: normalization specified and covered by TU-03.
- The group adds two tab stops in focus order after the result. Mitigation: place the group immediately after the highlighted value and verify navigation in TU-07 and E2E-10.
- A symbol as the only visible text may produce a poor accessible name or violate WCAG 2.5.3 if `aria-label` does not contain visible text. Mitigation: names `Celsius (°C)` and `Fahrenheit (°F)`, verified in TU-05.
- Duplicated temperature formatting outside the pure module would make display diverge from the active unit. Mitigation: `formatTemperature` as the single producer of temperature text, verified by TU-09 by asserting absence of `°C` values when Fahrenheit is active.
- The toggle inside `WeatherResult` always disappears with the result, including after a subsequent error. This is intentional per RF3, but means preference remains active even without a visible control. Mitigation: TI-01 and TI-03 verify absence of control and preservation of choice as separate behaviors.
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were read in full: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `python.md`, and `tests.md`.

- The change is limited to `frontend/` and `e2e/`; separation between applications is preserved, and no command is run at the repository root.
- The `view → components → services → backend` flow is respected. The conversion module is not backend access and therefore does not belong in `services/`; it will stay in `src/lib/`, an existing folder in the app.
- Each new type is in its own file; files stay under 100 lines, functions under 30 lines, with at most three parameters and explicitly declared props, without spread.
- Explicit typing for parameters and returns, `const` by default, strict comparisons, no `any`, simple non-nested ternaries, and no mutation of props or payload — conversion always produces new values.
- Conversion constants and symbols will be named in the module, with no magic numbers or strings scattered across JSX.
- No comments will be added to the code; intent is captured in the names `toFahrenheit`, `formatTemperature`, and `TemperatureUnitToggle`.
- No blank lines inside functions and components, maintaining the dense style already used in existing files.
- All new code will have automated tests; the testing pyramid is respected with a broad unit base, four integration cases, and a single E2E case, and minimum 80% coverage remains required.
- The `python.md` rules do not apply: no backend file is changed, and no async operation, environment variable, or logging is introduced.
- Before completion, `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` must pass in `frontend/`, in addition to the `e2e/` suite.

### Compliance with skills

- `react` — applicable and applied. Small single-responsibility components, explicit props without spread, controlled component with no redundant state, no `useEffect` for derived value, no premature memoization, `button` semantics with `aria-pressed` and accessible name, visible focus, and styling via Tailwind utilities. No deviations.
- `impeccable` — partially applicable. The toggle will follow the direction recorded in `DESIGN.md`: amber as an active-state cue, existing typography and horizontal rules, AA contrast, and readability from 360 px. A full visual review of the panel will not be conducted, since this is a two-option control added to an already designed screen.
- `create-techspec` — applied, with one deviation: project exploration was done through direct reading of `AGENTS.md`, the five rules, components, hooks, types, frontend tests, and the E2E suite, without using the Explore agent, because this session’s configuration restricts subagent use and the affected scope was small and fully identified. The other skill steps — PRD analysis, clarification questions, preserved template, and implementation-free specification — were completed.

### Relevant and dependent files

Frontend files to create:

- `frontend/src/types/temperature-unit.py`
- `frontend/src/lib/temperature.ts`
- `frontend/src/lib/temperature.test.ts`
- `frontend/src/components/TemperatureUnitToggle.tsx`
- `frontend/src/components/TemperatureUnitToggle.test.tsx`

Frontend files to modify:

- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/views/WeatherView.test.tsx`

E2E file to modify:

- `e2e/weather-panel.spec.ts`

Verified dependents, no change needed:

- `frontend/src/hooks/useWeatherSearch.ts`, `frontend/src/services/weather-service.py`, and `frontend/src/types/weather-response.py` — the unit does not participate in search or in the contract.
- `frontend/src/components/WeatherFeedback.tsx` and `frontend/src/components/SourceAttribution.tsx` — they do not display temperature.
- `e2e/mock-open-meteo.mjs` — current values already cover E2E conversion cases.
- The entire `backend/` directory.
