# Code review report — Language switch

## Summary

- Date: 2026-08-05
- Branch: `task-3`
- Status: APPROVED

## Compliance with rules

| Rule | Status | Notes |
|---|---|---|
| Layer separation | OK | Backend keeps `routes → services → data`; frontend keeps views, components, hooks, services, and i18n without cycles. |
| TypeScript and contracts | OK | No `any`; external values are refined and shared types remain in their own files. |
| Boundaries and cohesion | OK | View restructured into `WeatherHeader` and `WeatherSearchSection`; components and functions remain small. |
| React | OK | Context without unnecessary memoization, functional update in the switcher, and effect limited to document synchronization. |
| Accessibility | OK | Semantic button with accessible name, visible focus, labeled form, and messages with appropriate roles. |
| Tests | OK | Deterministic unit, integration, and E2E tests; coverage above 80%. |

## Adherence to the TechSpec

| Technical Decision | Implemented | Notes |
|---|---|---|
| Local translation without request | YES | `LanguageProvider`, typed dictionaries, and `useTranslation` update presentation only. |
| Bilingual contract in the backend | YES | `weatherCode`, `countryCode`, and normalized `lang` preserve `condition` as legacy. |
| Localized geocoding | YES | `language=pt|en` is propagated to the Open-Meteo client; country code is normalized. |
| Error stored by code | YES | Service and hook persist only `ApiErrorCode`; presentation translates by active language. |
| Formatting and fallback via `Intl` | YES | Conditions, measurements, and country respect the active language and use safe fallback. |
| No persistence | YES | Language starts in pt-BR and returns to default after reload. |
| Deterministic mock and E2E | YES | Mock returns `country_code` and reflects `language`; suite covers critical flows. |

## Verified tasks

| Task | Status | Notes |
|---|---|---|
| 1.0 Bilingual contract in the backend | COMPLETE | Subtasks, unit tests, and integration are present; compatible contract. |
| 2.0 Language switch in frontend and E2E validation | COMPLETE | I18n, UI, error state, service, mock, and E2E are present. |

## Tests

- Total tests: 53 deterministic
- Passing: 53
- Failing: 0
- Not applicable: 1 real performance scenario conditioned on `QA_REAL`
- Backend: `npm run build`, `npm test`, and `npm run test:coverage` — 27 tests; statement coverage 94.23%.
- Frontend: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` — 15 tests; statement coverage 96.85%.
- E2E: `npm test` in `e2e/` — 11 approved scenarios.

## Issues found

| Severity | File | Line | Description | Suggestion |
|---|---|---|---|---|
| Low | `frontend/src/views/WeatherView.tsx` | pre-review | Concentrated JSX reduced readability of the view composition. | Fixed by extracting `WeatherHeader` and `WeatherSearchSection`; tests rerun. |

## Positive points

- The contract preserves compatibility while exposing the stable data needed for local translation.
- The search hook remains independent from context, making testing easier and avoiding coupling.
- The suite covers WMO conditions, fallbacks, error, search in progress, keyboard, responsiveness, and no request on switch.

## Recommendations

- Resolve in the future the four existing lint warnings in coverage artifacts and in `components/ui/button.tsx`.
- Run the scenario `QA_REAL=1 npm run test:real-performance` when an environment with real providers is available.

## Conclusion

APPROVED. The implementation adheres to the TechSpec and tasks, respects applicable rules, and passed all required validations. The only point identified in the review was fixed and revalidated.
