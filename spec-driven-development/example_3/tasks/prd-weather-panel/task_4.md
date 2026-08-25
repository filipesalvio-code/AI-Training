File: /Users/filipesalvio/AI-Training/spec-driven-development/example_3/tasks/prd-weather-panel/task_4.md

# Task 4.0: Build the accessible and responsive panel interface

## Overview

Replace the frontend health indicator with the complete weather lookup experience, composing form, asynchronous feedback, result, and attribution with accessible semantics, pt-BR language, and an operable layout starting at 360 px.

<skills>
### Skill compliance

- `execute-task`: use to implement this task after completing task 3.
- `react`: mandatory loading before any changes to components, view, hooks, integration, accessibility, Tailwind, or React tests.
- `impeccable`: applicable to visual composition, hierarchy, responsiveness, states, UX copy, and accessible polish of the panel; use without conflicting with the PRD, the TechSpec, or the `react` skill.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were considered.

- Keep components small and single-responsibility; views should only compose components and coordinate the hook.
- Do not access the backend directly in components or views, and do not duplicate service logic.
- Use semantic HTML, programmatic labels, accessible names, live regions, and visible focus.
- Test by perceived behavior and by accessible roles and names, without coupling to CSS classes.
- Use Tailwind for local styles and limit `index.css` to required tokens and base styles.
- Respect `.ts`/`.tsx` files up to 100 lines, functions and components up to 30 lines, and explicitly typed props.
- Do not add comments in code except for exceptional need, and do not add unnecessary UI dependencies.
- Run lint, typecheck, build, tests, and coverage before completing the task.
- There is no planned deviation from the rules.
</rules>

<requirements>
- RF1: provide a labeled text field and clear action to submit city search.
- RF4: show city, administrative division when available, and country of the resolved location.
- RF9 to RF12: display the five weather data points with Portuguese labels and units returned by the contract.
- RF13: present perceptible loading and reflect action blocking during lookup.
- RF14 to RF16: present validation, missing city, and unavailability without contradictory data, keeping the field editable for retry.
- RF17: show visible attribution to Open-Meteo and working source and license links alongside the result.
- Make loading, success, validation, and error identifiable and announceable without relying only on color or icons.
- Ensure logical focus order, keyboard submission, visible focus, and associations with `aria-invalid`, `aria-describedby`, `role=status/alert`, and `aria-busy` according to state.
- Keep content readable and operable from 360 px and at 1280 px, with no horizontal overflow caused by functionality.
- Set `lang="pt-BR"`, a coherent title, and Brazilian Portuguese interface text.
- Remove polling and the `/health` indicator from the frontend; the endpoint will continue to exist only in the backend.
</requirements>

## Subtasks

- [x] 4.1 Create form, feedback, result, and attribution as independent, typed components.
- [x] 4.2 Create `WeatherView` to compose components and consume only `useWeatherSearch`.
- [x] 4.3 Update `App`, HTML document, and styles to replace the health check and deliver responsive visual hierarchy.
- [x] 4.4 Implement the unit test for full result and attribution.
- [x] 4.5 Implement the unit test for accessible semantics of states.
- [x] 4.6 Implement the integration test for the four states across service, hook, and components.
- [x] 4.7 Run frontend lint, typecheck, build, tests, and coverage.

## Implementation details

Follow `techspec.md`, especially frontend components under “Component view,” the `WeatherLocation`, `CurrentConditions`, `WeatherUnits`, and `SourceAttribution` models, “User experience” in the PRD, “Unit tests,” “Integration tests,” and the decisions for display-ready contract and health indicator removal.

## Related acceptance criteria

- CA-01
- CA-02
- CA-03
- CA-05
- CA-06
- CA-07
- CA-08
- CA-10
- CA-11
- CA-12
- CA-13

## Task tests

### Unit tests

- [ ] TU-FE-03 — Shows complete success and attribution
- [ ] TU-FE-06 — Exposes asynchronous states through accessible semantics

### Integration tests

- [ ] TI-FE-01 — Integrates hook, service, and components across the four states

## Relevant files

- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/index.html`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.py`
- `*.test.tsx` tests next to components and the view
