# QA Report — Switching Between Celsius and Fahrenheit

The browser tool evidence is saved in `tasks/prd-celsius-fahrenheit/evidences/`.

## Summary

- Date: 2026-08-05
- Status: APPROVED
- Total acceptance criteria: 13
- Acceptance criteria met: 13
- Bugs found: 1, fixed
- Independent revalidation: successfully completed on 2026-08-05

## Validation environment

- Browser tool: Playwright Chromium.
- Frontend: `http://127.0.0.1:5100`.
- Backend: `http://127.0.0.1:3000`.
- Open-Meteo mock: `http://127.0.0.1:3070`.
- Shutdown: the processes started by this run were terminated; processes from another worktree were not interrupted.

## Verified acceptance criteria

| ID | Acceptance criterion | Test cases | Status | Evidence |
| --- | --- | --- | --- | --- |
| CA-01 | Converts and displays temperature in Fahrenheit | TU-02, TU-06, TU-09, E2E-10 | PASSED | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-02 | Keeps feels-like temperature in the active unit | TU-04, TU-09, E2E-10 | PASSED | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-03 | Applies the correct formula and rounding | TU-01, TU-02 | PASSED | Vitest tests |
| CA-04 | Exposes state and accessible names on the toggle | TU-05, E2E-10 | PASSED | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-05 | Switches without an additional request | TI-02, E2E-10 | PASSED | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-06 | Switches without loading state | TI-02, E2E-10 | PASSED | Vitest and Playwright tests |
| CA-07 | Preserves unit between searches | TI-03, E2E-10 | PASSED | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-08 | Returns to Celsius after reload | TI-04, E2E-10 | PASSED | Playwright test |
| CA-09 | Keeps humidity and wind in metric units | TU-10 | PASSED | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-10 | Hides toggle outside the result | TI-01 | PASSED | [Initial 360 px](evidences/e2e-08-initial-360.png) |
| CA-11 | Works via keyboard with focus and labels | TU-07, E2E-07, E2E-10 | PASSED | Playwright test |
| CA-12 | Reapplying the active unit does not change the reading | TU-08 | PASSED | Vitest test |
| CA-13 | Keeps control readable at 360 px and 1280 px | TU-11, E2E-08 | PASSED | [360 px](evidences/e2e-08-360.png), [1280 px](evidences/e2e-08-1280.png) |

## Executed E2E tests

| ID | Flow | Result | Notes |
| --- | --- | --- | --- |
| E2E-01 | Search and complete result | PASSED | Rounded values in Celsius |
| E2E-02 | No direct call to Open-Meteo | PASSED | Browser uses only the backend |
| E2E-03 | Validation without request | PASSED | [Evidence](evidences/e2e-03-validation.png) |
| E2E-04 | Recovery from city not found | PASSED | Successful retry |
| E2E-05 | External error and retry | PASSED | [Evidence](evidences/e2e-05-external-error.png) |
| E2E-06 | Loading and duplicate blocking | PASSED | Controlled slow mock |
| E2E-07 | Keyboard navigation and triggering | PASSED | Deterministic loading |
| E2E-08 | Layout at 360 px and 1280 px | PASSED | No horizontal overflow |
| E2E-09 | Controlled budget | PASSED | p95 within 3 s |
| E2E-10 | Switch, preserve, and reload | PASSED | No request on switch |

## Automated tests and coverage

| Layer | ID | Result | Validation/command | Notes |
| --- | --- | --- | --- | --- |
| Unit/Integration | TU-01 to TU-11, TI-01 to TI-04 | PASSED | `npm test` | 24 tests passed |
| Coverage | — | PASSED | `npm run test:coverage` | 97.08% statements, 90.32% branches |
| Quality | — | PASSED | `npm run lint`, `npm run typecheck`, `npm run build` | Lint with no errors; 4 preexisting warnings |
| E2E | E2E-01 to E2E-10 | PASSED | `npm test` in `e2e/` | 10 passed; real performance was skipped by configuration |

- Coverage: 97.08% statements, above the 80% target.

## Accessibility

- [x] Keyboard navigation: `Tab` and `Enter` verified in E2E-07 and E2E-10.
- [x] Interactive elements with descriptive labels: Celsius and Fahrenheit buttons have accessible names and `aria-pressed`.
- [x] Images: there are no informative images on screen.
- [x] Contrast: active state in amber and inactive in white over slate; visually verified.
- [x] Form: city field has an associated label.
- [x] Errors: validation and unavailability use an accessible alert.
- [x] Fonts: readability checked at 360 px and 1280 px.

## Bugs found and fixed

| ID | Description | Severity | Status | Fix | Regression test | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-01 | E2E-07 checked for a loading state that could disappear before assertion with an immediate response. | Low | Fixed | Uses the controlled city `Lento`, whose response keeps the state visible. | E2E-07 | Approved Playwright output |

## Conclusion

The feature meets all 13 acceptance criteria. Switching happens locally, preserves preference during the page session, returns to Celsius on a new load, and remains accessible and responsive.
