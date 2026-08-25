# QA Report — Language Switch

Browser evidence is in `tasks/prd-language-switch/evidences/`.

## Summary

- Date: 2026-08-05
- Status: APPROVED
- Total acceptance criteria: 17
- Acceptance criteria met: 17
- Bugs found: 0

## Verified acceptance criteria

| ID | Acceptance criterion | Test cases | Status | Evidence |
|---|---|---|---|---|
| CA-01 | Switcher visible and triggered with one click | E2E-10 | PASSED | `evidences/initial-en-360.png` |
| CA-02 | Initial screen translated | TU-FE-10, E2E-11 | PASSED | `evidences/initial-en-360.png` |
| CA-03 | Result preserved and translated | TI-FE-11, E2E-12 | PASSED | `evidences/result-en-360.png` |
| CA-04 | WMO conditions in English | TU-BE-13, TU-FE-11, E2E-12 | PASSED | `evidences/result-en-360.png` |
| CA-05 | Validation translated | TI-FE-13, E2E-15 | PASSED | `evidences/validation-en.png` |
| CA-06 | Stable and recoverable errors | TI-BE-12, TI-FE-13, E2E-15 | PASSED | `evidences/validation-en.png` |
| CA-07 | Typed text preserved | TI-FE-12, E2E-14 | PASSED | `evidences/initial-en-360.png` |
| CA-08 | In-progress query preserved | TI-FE-14, E2E-16 | PASSED | `evidences/validation-en.png` |
| CA-09 | Local units and numeric format | TU-FE-13, E2E-12 | PASSED | `evidences/result-en-360.png` |
| CA-10 | Localized/fallback location and country | TU-BE-10 to TU-BE-12, TU-FE-14 to TU-FE-15, E2E-12 | PASSED | `evidences/result-en-360.png` |
| CA-11 | Network-free switch within 300 ms | E2E-13 | PASSED | `evidences/initial-en-360.png` |
| CA-12 | Language and document title synchronized | TU-FE-18, E2E-17 | PASSED | `evidences/initial-en-360.png` |
| CA-13 | Keyboard-operable switcher | E2E-18, E2E-07 | PASSED | `evidences/initial-en-360.png` |
| CA-14 | Accessible name and translated labels | TU-FE-19, E2E-18 | PASSED | `evidences/initial-en-360.png` |
| CA-15 | pt-BR restored on reload | E2E-19 | PASSED | `evidences/initial-en-360.png` |
| CA-16 | Responsive layout at 360 px and 1280 px | E2E-20, E2E-08 | PASSED | `evidences/initial-en-360.png`, `evidences/initial-en-1280.png` |
| CA-17 | English search uses backend only | E2E-21, E2E-02, E2E-09 | PASSED | `evidences/result-en-360.png` |

## Executed E2E tests

| ID | Flow | Result | Notes |
|---|---|---|---|
| E2E-01 to E2E-09 | Weather dashboard and regression | PASSED | 9 deterministic scenarios approved. |
| E2E-10 to E2E-21 | Language switch | PASSED | Switcher, translations, state, document, responsiveness, and `lang=en` approved. |
| Real E2E-09 | p95 with real providers | NOT APPLICABLE | Requires `QA_REAL=1`; scenario correctly skipped. |

## Automated tests and coverage

| Layer | ID | Result | Validation/command | Notes |
|---|---|---|---|---|
| Backend | TU-BE-10 to TI-BE-12 | PASSED | `npm run build`, `npm test`, `npm run test:coverage` | 27 tests passed. |
| Frontend | TU-FE-10 to TI-FE-14 | PASSED | `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npm run test:coverage` | 15 tests passed; lint with no errors. |
| E2E | E2E-01 to E2E-21 | PASSED | `npm test` in `e2e/` | 11 scenarios passed and 1 skipped by configuration. |

- Backend coverage: statements 94.23%, branches 91.86%, functions 97.36%, lines 97.18%.
- Frontend coverage: statements 96.85%, branches 90.00%, functions 100.00%, lines 97.32%.
- Minimum 80% target met in both applications.

## Accessibility

- [x] Keyboard navigation: `Tab` reaches switcher, field, and button; `Enter` switches the language.
- [x] Interactive elements: switcher has an accessible name with current and target language; button and field have visible names.
- [x] Images: there are no content images on this screen.
- [x] Contrast: visual inspection of states in dark theme confirmed readable text and controls.
- [x] Form: `label` associated with the city field and `aria-invalid` in validation.
- [x] Messages: loading uses `role=status` and error/validation use `role=alert`.
- [x] Typography: readability preserved at 360 px and 1280 px, with no horizontal scrolling.

## Bugs found and fixed

No bugs were found during this run.

## Conclusion

QA APPROVED. The 17 PRD acceptance criteria were verified, automated and E2E tests passed, coverage exceeds 80%, and visual evidence was recorded.
