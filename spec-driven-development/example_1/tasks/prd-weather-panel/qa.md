# QA report — Climate Dashboard

Evidence from the browser tool is saved in `tasks/prd-weather-panel/evidences/`.

## Summary

- Date: 2026-08-02
- Status: PASSED
- Total acceptance criteria: 13
- Acceptance criteria met: 13
- Bugs found: 0
- Deterministic environment: Open-Meteo mock `3050`, backend `3001`, frontend `5101`
- Actual round: backend `3003`, frontend @@FENCE5@ @, production Open-Meteo

## Verified acceptance criteria

| ID | Acceptance criteria | Test cases | Status | Evidence |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Valid search displays the current conditions of the first locality | TU-BE-03, TU-BE-05, TU-FE-03, TI-BE-01, TI-FE-01, E2E-01 | PASSED | [manual-success.png](evidences/manual-success.png) |
| CA-02 | Uses the first location without intermediate selection and identifies the location | TU-BE-03, TU-BE-04, TU-FE-03, TI-BE-01, E2E-01 | PASSED | [success.png](evidences/success.png) |
| CA-03 | Displays temperature, feels-like temperature, condition, humidity, and wind in pt-BR and metric units | TU-BE-05, TU-BE-06, TU-FE-03, TI-BE-01, E2E-01 | PASSED | [manual-success.png](evidences/manual-success.png) |
| CA-04 | Browser queries only the backend, with no direct call to Open-Meteo | E2E-02 | PASSED | E2E confirmed only `127.0.0.1:3001/weather` |
| CA-05 | Invalid input receives guidance and does not trigger a weather search | TU-BE-02, TU-FE-01, TI-BE-02, TI-FE-01, E2E-03 | PASSED | [manual-validation-error.png](evidences/manual-validation-error.png) |
| CA-06 | City not found reports the issue and allows retry | TU-FE-04, TI-BE-03, TI-FE-01, E2E-04 | PASSED | [manual-not-found.png](evidences/manual-not-found.png) |
| CA-07 | Unavailability displays an actionable error, removes the previous result, and allows retry | TU-BE-07, TU-BE-08, TU-FE-05, TI-BE-04, TI-FE-01, E2E-05 | PASSED | [unavailable-error.png](evidences/unavailable-error.png) |
| CA-08 | Loading is noticeable and duplicate submissions are blocked | TU-FE-02, TI-FE-01, E2E-06 | PASSED | [manual-loading.png](evidences/manual-loading.png) |
| CA-09 | At least 95% of requests complete within 3 seconds | TU-BE-08, E2E-09 | PASSED | [controlled-performance.json](evidences/controlled-performance.json), [real-performance.json](evidences/real-performance.json) |
| CA-10 | Full flow works by keyboard with logical and visible focus | TU-FE-06, E2E-07 | PASSED | E2E-07 passed; `:focus-visible` checked on button |
| CA-11 | States and messages are identifiable and announceable | TU-FE-06, TI-FE-01, E2E-07 | PASSED | [manual-validation-error.png](evidences/manual-validation-error.png), [manual-loading.png](evidences/manual-loading.png) |
| CA-12 | Layout remains readable and operable at 360 px and 1280 px without overflow | E2E-08 | PASSED | [manual-responsive-360.png](evidences/manual-responsive-360.png), [manual-responsive-1280.png](evidences/manual-responsive-1280.png) |
| CA-13 | Attribution to Open-Meteo and license are visible with functional links | TU-FE-03, E2E-01 | PASSED | [manual-success.png](evidences/manual-success.png) |

## E2E tests run

| ID | Flow | Result | Remarks |
|----|-------|-----------|-------------|
| E2E-01 | Search and display of the complete result | PASSED | Location, five conditions, units, and attribution verified |
| E2E-02 | Browser network isolation | PASSED | No requests to the Open-Meteo host; backend received `/weather` |
| E2E-03 | Invalid input validation | PASSED | Zero weather requests; `aria-invalid` and `aria-describedby` present |
| E2E-04 | Recovery after city not found | PASSED | New valid search completed after error |
| E2E-05 | Proper cleanup after unavailability and retry | PASSED | Previous result removed and retry completed |
| E2E-06 | Loading and duplicate submission | PASSED | One request; button disabled while waiting |
| E2E-07 | Keyboard accessibility and announcements | PASSED | Enter key, accessible status, and result region |
| E2E-08 | Responsiveness at 360 px and 1280 px | PASSED | No horizontal overflow |
| E2E-09 | Controlled end-to-end performance | PASSED | 20 samples, p95 of 63 ms |

## Automated tests and coverage

| Layer | ID | Result | Validation/command | Remarks |
|--------|----|-----------|-------------------|-------------|
| Backend | TU-BE-01 a TU-BE-08 | PASSED | `cd backend && npm test` | 46 tests passed |
| Backend | TI-BE-01 a TI-BE-05 | PASSED | `cd backend && npm test` | HTTP contracts and health check verified |
| Frontend | TU-FE-01 a TU-FE-06 | PASSED | `cd frontend && npm test` | 14 tests passed |
| Frontend | TI-FE-01 | PASSED | `cd frontend && npm test` | Four integrated states verified |
| E2E | E2E-01 a E2E-09 | PASSED | `cd e2e && npm test` | 9 tests passed |
| Frontend | — | PASSED | `npm run lint`, `npm run typecheck`, `npm run build` | 0 errors; non-blocking warnings already exist |
| Backend | — | PASSED | `npm run build` | Build complete |

- Frontend coverage: 96.52% statements, 89.69% branches, 100% functions, 100% lines; minimum goal of 80% met. - Backend coverage: 94.78% statements, 92.06% branches, 96.61% functions, 95.49% lines; minimum goal of 80% met. - Controlled performance: 20 samples, p95 of 63 ms, approved. - Real-world performance: 20 cities across different regions and languages, p95 of 812 ms, approved; details in `real-performance.json`.

## Accessibility

- [x] Keyboard navigation with Tab and Enter checked; focus visible via @@ FENCE21 @@. - [x] Interactive elements have accessible names and links have descriptive names. - [x] There are no content images on screen, so no image without @@ FENCE22 @@ is applicable. - [x] Visual contrast and focus checked on desktop and 360 px viewport. - [x] Field has @@ FENCE23 @@ associated via @@ FENCE24 @@/@@ FENCE25 @@. - [x] Validation message is clear, uses @@ FENCE26 @@, @@ FENCE27 @@, and @@ FENCE28 @@. - [x] Loading uses @@ FENCE29 @@, @@ FENCE30 @@, and @@ FENCE31 @@; success has a semantic region. - [x] Texts and controls remain readable from 360 px. - [x] Document uses @@ FENCE32 @@ and a coherent title. - [x] Browser console: 0 errors and 0 warnings from the application during inspection.

## Bugs found and fixed

No bugs were found in this run. There were no code changes and no need for additional regression testing.

## Conclusion

The climate dashboard meets all 13 acceptance criteria. Unit, integration, and E2E suites passed, coverage goals were reached, the real performance run showed a p95 of 812 ms, and the manual checks for accessibility, network, and responsiveness were approved. QA **PASSED**.
