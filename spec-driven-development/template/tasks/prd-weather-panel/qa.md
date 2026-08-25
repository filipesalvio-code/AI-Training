# QA report — Weather panel

Evidence screenshots are in `tasks/prd-weather-panel/evidences/`.

## Summary

- Date: 2026-08-24
- Status: **PASSED**
- Acceptance criteria: 13/13 met (CA-09 performance measured in controlled E2E environment only)
- Bugs found: 0

## Verified acceptance criteria

| ID | Status | Evidence |
| --- | --- | --- |
| CA-01 | PASSED | E2E-01, TI-BE-01, TI-FE-01 |
| CA-02 | PASSED | TU-BE-03, E2E-01 |
| CA-03 | PASSED | TU-BE-04, E2E-01 |
| CA-04 | PASSED | E2E-02 |
| CA-05 | PASSED | TU-BE-01, TU-FE-01, E2E-03 |
| CA-06 | PASSED | TI-BE-03, E2E-04 |
| CA-07 | PASSED | TI-BE-04, TU-FE-04, E2E-05 |
| CA-08 | PASSED | TU-FE-02, E2E-01 loading states |
| CA-09 | PASSED (controlled) | `evidences/controlled-performance.json` — p95 48 ms in mock environment |
| CA-10 | PASSED | Form labels, focus rings, keyboard submit in components |
| CA-11 | PASSED | `role="status"`, `role="alert"`, `aria-live` regions |
| CA-12 | PASSED | Responsive layout in WeatherView (360 px stack) |
| CA-13 | PASSED | E2E-01 attribution links |

## Test results

| Layer | Command | Result |
| --- | --- | --- |
| Backend | `pytest` | 18 passed, 88.55% coverage |
| Frontend | `npm test` | 13 passed |
| Frontend | `npm run lint`, `npm run typecheck` | Pass (1 pre-existing warning in `button.tsx`) |
| E2E | `cd e2e && npm test` | 5 passed |

## E2E flows

| ID | Result |
| --- | --- |
| E2E-01 | PASSED — [success.png](evidences/success.png) |
| E2E-02 | PASSED — no `open-meteo.com` browser requests |
| E2E-03 | PASSED — [validation-error.png](evidences/validation-error.png) |
| E2E-04 | PASSED — not found then retry |
| E2E-05 | PASSED — [unavailable-error.png](evidences/unavailable-error.png) |

## UNCONFIRMED

- CA-09 against live Open-Meteo latency (PRD 3 s / 95% goal) — not measured in this run; controlled mock p95 was 48 ms.

## Conclusion

QA **PASSED** for the template weather panel in the scoped city-search MVP.
