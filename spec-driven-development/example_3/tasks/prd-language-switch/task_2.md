# Task 2.0: Frontend language switch and E2E validation

## Overview

Deliver the user-facing language switch: a toggle button in the header that changes the entire experience between pt-BR and English in one action, without reloading the page, without a request, and without losing typed text or the displayed result. The task creates the frontend’s own i18n layer — types, dictionaries, context, hook, and `Intl`-based formatters — migrates existing components to translated text, replaces the error message stored in state with the error code, and starts sending `lang` in the backend query.

Depends on task 1.0, which exposes `weatherCode` and `countryCode`. It concludes with the updated Open-Meteo mock and the E2E suite covering the feature’s critical flows in both languages.

<skills>
### Skills compliance

- `react` — required before any frontend change. Small components with single responsibility and explicit props without spread; hooks with `use` prefix; `useEffect` only to synchronize the document, which is an external system; no unnecessary `useMemo`; no redundant derived state; functional update in `toggleLanguage`; `button` semantics, accessible name, visible focus, and Tailwind styling.
- `execute-task` — drives the implementation of this task.
</skills>

<rules>
### Compliance with AGENTS.md and rules

Reading confirmed for `AGENTS.md` and all rules in `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `python.md`, and `tests.md`.

- Keep the flow `view → components/hooks → services → backend`. i18n modules do not perform HTTP access and the HTTP service does not know dictionaries; no new import may create a cycle.
- `useWeatherSearch` receives the language as a parameter and does not import the i18n context, remaining testable without a provider.
- Files up to 100 lines, functions up to 30 lines, React components up to 30 lines, maximum of three parameters. Dictionaries, WMO labels, and formatters stay in separate files by language and responsibility.
- Each shared type in its own file within `frontend/src/types/`.
- Explicit typing, no `any`, `unknown` refined in HTTP response validation, `const` by default, strict comparisons, arrow functions only in callbacks, and no nested ternaries.
- No comments in code; naming and function extraction express intent.
- No new dependencies and no lock file changes in any of the three projects.
- Deviation recorded and justified in the TechSpec: creation of the `frontend/src/i18n/` folder, not planned in `folder-structure.md`, because it represents a clear and recurring responsibility that does not fit in `services/`, `components/`, `hooks/`, or `types/`.
- E2E tests remain in `e2e/`, outside `frontend/` and `backend/`. All new code has tests; minimum 80% coverage maintained by the thresholds already configured in `frontend/vitest.config.ts`.
</rules>

<requirements>
- FR1 to FR4: language control in the header, visible without scrolling from 360 px, toggling in one action, communicating active and target language by text, available in all four states.
- FR5 to FR8: all product text in the active language, including non-visible accessible labels, with no leftovers from the previous language.
- FR9 and FR10: weather condition translated from `weatherCode` and country translated from `countryCode`, with fallback to the received value when there is no match.
- FR11 and FR12: metric units preserved in both languages and numeric values formatted according to the active language convention.
- FR13 to FR17: switching preserves typed text, result, ongoing query, and visible messages, without reloading the page or changing the address.
- FR18 and FR19: default language pt-BR on every load, with no persistence of the choice.
- FR20 and FR21: document language declaration and page title consistent with the active language.
</requirements>

## Subtasks

- [x] 2.1 Create types `language.ts`, `translation-key.ts`, `translations.ts`, and `language-context-value.ts`, and dictionaries `i18n/pt-br.ts` and `i18n/en.ts` typed as `Record<TranslationKey, string>`, with the key table from the TechSpec.
- [x] 2.2 Create `i18n/language-context.ts`, `components/LanguageProvider.tsx`, `hooks/useTranslation.ts`, and `hooks/useDocumentLanguage.ts`, keeping language in state, without persistence, and defaulting to pt-BR on every load.
- [x] 2.3 Create `i18n/weather-conditions-pt-br.ts`, `i18n/weather-conditions-en.ts`, `i18n/weather-condition-label.ts`, `i18n/format-measurement.ts`, and `i18n/country-name.ts`, with the expected fallbacks.
- [x] 2.4 Create `components/LanguageToggle.tsx` and compose `App.tsx` and `WeatherView.tsx`, placing the toggle in the header and ensuring it is not remounted on switch, to preserve focus.
- [x] 2.5 Migrate `WeatherView`, `WeatherSearchForm`, `WeatherFeedback`, `WeatherResult`, and `SourceAttribution` to translated text, including the query section `aria-label`.
- [x] 2.6 Replace the message with the error code in `types/api-error.ts`, `types/weather-search-state.ts`, `services/weather-service.ts`, `hooks/useWeatherSearch.ts`, and `WeatherFeedback`, removing fixed frontend messages.
- [x] 2.7 Send `lang` in `GET /weather` from the active language and update response validation to require `weatherCode` and accept nullable `countryCode`.
- [x] 2.8 Update `e2e/mock-open-meteo.mjs` to return `country_code` and reflect the received `language`, and adjust existing frontend and E2E tests affected by the contract and header.
- [x] 2.9 Write this task’s unit, integration, and E2E tests.
- [x] 2.10 Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` in `frontend/`, and the `e2e/` suite, fixing anything that fails.

## Implementation details

Follow `techspec.md`:

- “System Architecture → Component View” for the translation flow and the list of new and modified frontend components.
- “Implementation Design → Key interfaces” for `useTranslation`, `weatherConditionLabel`, `formatMeasurement`, `countryName`, and `WeatherService`, including the decision not to memoize the context value.
- “Data models” for `Language`, `TranslationKey`, `Translations`, `LanguageContextValue`, and `ApiError`, for the full translation key table, and for the note on sentence composition with links in `SourceAttribution`.
- “Data models → WMO code mapping → label by language” and “Client-side number and country formatting”, respecting the note about preserved spacing between value and unit.
- “API endpoints → `GET /weather`” for sending `lang` and for new response fields.
- “Technical considerations → Key decisions” for error stored by code, language by parameter in `search`, and no additional live region for switching.
- “Technical considerations → Known risks” for text length at 360 px, `Intl.DisplayNames` fallback, and divergence between dictionaries.

## Related acceptance criteria

- AC-01
- AC-02
- AC-03
- AC-04
- AC-05
- AC-06
- AC-07
- AC-08
- AC-09
- AC-10
- AC-11
- AC-12
- AC-13
- AC-14
- AC-15
- AC-16
- AC-17

## Task tests

### Unit tests

- [x] UT-FE-10 — Ensures parity between dictionaries
- [x] UT-FE-11 — Translates all WMO codes in both languages
- [x] UT-FE-12 — Falls back label for unknown code
- [x] UT-FE-13 — Formats number according to language
- [x] UT-FE-14 — Translates country from `countryCode`
- [x] UT-FE-15 — Falls back country without code or translation
- [x] UT-FE-16 — Toggles language in one call
- [x] UT-FE-17 — Fails when using translation outside provider
- [x] UT-FE-18 — Syncs document `lang` and `title`
- [x] UT-FE-19 — Exposes accessible name and toggle text
- [x] UT-FE-20 — Translates error from code
- [x] UT-FE-21 — Sends `lang` in backend query

### Integration tests

- [x] IT-FE-10 — Translates the entire screen in initial state
- [x] IT-FE-11 — Translates result without a new request
- [x] IT-FE-12 — Preserves typed text when switching
- [x] IT-FE-13 — Translates validation and error without losing state
- [x] IT-FE-14 — Does not cancel an ongoing query

### E2E tests

- [x] E2E-10 — Finds the toggle without scrolling at 360 px
- [x] E2E-11 — Translates the complete initial screen
- [x] E2E-12 — Keeps and translates the displayed result
- [x] E2E-13 — Makes no request on switch and responds within 300 ms
- [x] E2E-14 — Preserves typed text
- [x] E2E-15 — Translates validation and error messages
- [x] E2E-16 — Translates during an ongoing query
- [x] E2E-17 — Adjusts document `lang` and title
- [x] E2E-18 — Operates the toggle by keyboard
- [x] E2E-19 — Returns to default after reload
- [x] E2E-20 — Keeps layout at 360 px and 1280 px in English
- [x] E2E-21 — English query sends `lang` and does not regress

## Relevant files

To create:

- `frontend/src/i18n/language-context.ts`
- `frontend/src/i18n/translations.ts`
- `frontend/src/i18n/pt-br.ts`
- `frontend/src/i18n/en.ts`
- `frontend/src/i18n/weather-conditions-pt-br.ts`
- `frontend/src/i18n/weather-conditions-en.ts`
- `frontend/src/i18n/weather-condition-label.ts`
- `frontend/src/i18n/format-measurement.ts`
- `frontend/src/i18n/country-name.ts`
- `frontend/src/components/LanguageProvider.tsx`
- `frontend/src/components/LanguageToggle.tsx`
- `frontend/src/hooks/useTranslation.ts`
- `frontend/src/hooks/useDocumentLanguage.ts`
- `frontend/src/types/language.py`
- `frontend/src/types/translation-key.py`
- `frontend/src/types/translations.py`
- `frontend/src/types/language-context-value.py`
- `e2e/language-switch.spec.ts`
- tests `*.test.ts` and `*.test.tsx` near their corresponding modules

To modify:

- `frontend/src/App.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/views/WeatherView.test.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/hooks/useWeatherSearch.test.ts`
- `frontend/src/services/weather-service.py`
- `frontend/src/services/weather-service.test.ts`
- `frontend/src/types/weather-response.py`
- `frontend/src/types/api-error.py`
- `frontend/src/types/weather-search-state.py`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
