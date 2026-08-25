# Task 5.0: Implement and run the E2E tests for the feature

## Overview

Validate the full panel from the user’s perspective with Playwright, covering functional flows, network isolation, recovery, keyboard, accessible announcements, responsiveness, and the end-to-end budget in controlled and real QA environments.

<skills>
### Compliance with skills

- `execute-task`: use so that create the E2E infrastructure and test cases for this task after completing tasks 1 to 4. - `execute-qa`: use during final execution and stabilization against the PRD, TechSpec, and tasks, recording evidence and fixes according to the skill instructions. - `react`: load before any required fixes in frontend components, hooks, accessibility, or styles found during validation. </skills>

<rules>
### Compliance with AGENTS.md and rules

`AGENTS.md` and all files in `.agents/rules/` were considered.

- Keep the Playwright project independent in `e2e/`, with its own `package.json` and lockfile, and do not create a `package.json` at the root. - Write a few complete E2E flows without replacing the unit and integration coverage already implemented. - Use selectors by roles, labels, and accessible names, without relying on classes or internal details. - Keep tests deterministic, independent, repeatable, and self-validating; control responses and latency in CI. - Do not use real Open-Meteo in common automated tests; restrict real integration to the QA performance run. - Fix found bugs and add regression coverage at the lowest appropriate layer, loading the required skills before changing code. - Run all validations for the three projects before concluding the feature. - There is no planned deviation from the rules. </rules>

<requirements>
- Validate all AC-01 to AC-13 criteria in the corresponding E2E cases defined by the TechSpec. - Confirm that the browser calls only frontend and backend, and fail the test if there is any browser request to any Open-Meteo host. - Control success, 404, 503, and pending response at the appropriate HTTP boundary so that scenarios are repeatable. - Confirm no request so that invalid input and only one request during duplicate submissions. - Exercise recovery after city not found and unavailability, verifying the removal of previous data. - Validate focus order, keyboard operation, visual focus indicator, accessible names, and announcements of asynchronous changes. - Validate 360 px and 1280 px without horizontal overflow and with legible, operable content and controls. - Measure end-to-end time in CI with controlled responses and require that at least 95% of samples complete within 3 seconds. - Run at least 20 real queries in QA, distributed across cities from different languages and regions, recording p95, sample, date, and network conditions. - Do not fail the deterministic suite only because of real provider unavailability, but prevent functional approval of AC-09 if real p95 exceeds 3 seconds without justification and reassessment. - Validate that attribution and license links are functional without making common tests dependent on the availability of those sites. </requirements>

## Subtasks

- [x] 5.1 Create the independent Playwright project, its configuration, scripts, dependency, and lockfile. - [x] 5.2 Prepare joint frontend and backend execution and the controlled responses required for deterministic tests. - [x] 5.3 Implement the six E2E cases for functional, network, and recovery flows. - [x] 5.4 Implement E2E cases for keyboard, accessible announcements, and responsiveness in both viewports. - [x] 5.5 Implement controlled performance measurement and prepare the real QA run procedure. - [x] 5.6 Run frontend lint, typecheck, builds, tests, and coverage; backend build, tests, and coverage; and the full E2E suite. - [x] 5.7 Run the real performance round and record QA evidence and results.

## Implementation details

Follow `techspec.md`, especially “E2E tests”, the separation between deterministic measurement and real QA, “Development sequencing”, “Technical dependencies”, “Monitoring and observability”, and “Known risks”. Controlled responses must exactly follow the public contract of `GET /weather`.

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

### E2E tests

- [x] E2E-01 — Search for a city and display the first complete result
- [x] E2E-02 — Ensure the browser does not call Open-Meteo
- [x] E2E-03 — Correct invalid input without request
- [x] E2E-04 — Recover from city not found
- [x] E2E-05 — Clear previous success after unavailability and allow retry
- [x] E2E-06 — Display loading and prevent duplicate submission
- [x] E2E-07 — Operate by keyboard and announce state changes
- [x] E2E-08 — Keep the layout operable at 360 px and 1280 px
- [x] E2E-09 — Measure the end-to-end query budget

## Relevant files

- `e2e/package.json`
- `e2e/package-lock.json`
- `e2e/playwright.config.ts`
- `e2e/weather-panel.spec.ts`
- `tasks/prd-weather-panel/evidences/`
- Frontend or backend files fixed during QA, along with their respective regression tests
