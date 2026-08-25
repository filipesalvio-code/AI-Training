# Task 1.0: Bilingual contract in the backend

## Overview

Prepare the backend so the frontend can translate the result without a new request. The `GET /weather` route now accepts an optional `lang`, passed through as the Geocoding API language, and the success contract gains `current.weatherCode` and `location.countryCode`. The `current.condition` field remains in pt-BR as legacy, preserving the compatibility required by the PRD. No English translation is written in the backend: this task delivers only the data that makes client-side translation possible.

The delivery is independently verifiable with FastAPI TestClient, before any frontend changes.

<skills>
### Compliance with skills

- `execute-task` — drives the implementation of this task.
- `react` — not applicable: this task does not change frontend code.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

Reading confirmed for `AGENTS.md` and all rules in `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `python.md`, and `tests.md`.

- Keep the `routes → services → data` flow: the route reads `lang`, the service normalizes and orchestrates, and the `data` layer builds the external URL. No new import may point backward or create a cycle.
- Each shared type remains in its own file inside `backend/src/types/`.
- Files up to 100 lines, functions up to 30 lines, at most three parameters, explicit typing, no `any`, `const` by default, strict comparisons, and guard clauses.
- Validate the raw `lang` value as `unknown` before using it; normalization must not throw an error or produce `400`.
- No comments in code; naming and function extraction should express intent.
- No new environment variable, no new dependency, no lock file change, and no blocking operation; centralized logging and graceful shutdown remain unchanged.
- All new code has tests; minimum coverage of 80% maintained by thresholds already configured in `backend/vitest.config.ts`. No deterministic test accesses the real Open-Meteo.
</rules>

<requirements>
- RF9: expose `current.weatherCode` so the condition description can be shown in the active language, covering all conditions already supported.
- RF10: expose `location.countryCode` and localize city, region, and country in the query according to `lang`; absence of code or designation degrades to the received value, without error.
- RF11: keep metric units unchanged in the contract.
- PRD constraint: the existing HTTP contract remains compatible — `current.condition` stays present and in pt-BR, and error codes remain stable and language-independent.
- PRD constraint: invalid, repeated, or missing `lang` degrades to the default and never produces a validation error.
</requirements>

## Subtasks

- [x] 1.1 Create `backend/src/services/normalize-language.py` converting the raw `lang` value to `'pt' | 'en'`, according to the TechSpec mapping table, without throwing an error for unknown value, array, or unexpected type.
- [x] 1.2 Extend `parse-geocoding-response.ts` to extract `country_code`, normalizing to uppercase when it matches two letters and to `null` in all other cases, without invalidating the query.
- [x] 1.3 Adjust `WeatherProvider` and `OpenMeteoClient` to receive the language in `searchFirstLocation` and send it in `language`, removing the fixed `pt` value.
- [x] 1.4 Update types `resolved-location.ts`, `weather-location.ts`, and assembly in `get-current-weather.ts` to include `countryCode` and `weatherCode`, preserving `condition` in pt-BR.
- [x] 1.5 Adjust `weather-route.ts` to read `lang`, normalize it, and pass it to the use case, keeping current `city` validation as the only source of `400`.
- [x] 1.6 Write unit and integration tests for this task and update existing affected backend tests for the new fields.
- [x] 1.7 Run `npm run build`, `npm test`, and `npm run test:coverage` in `backend/` and fix whatever fails.

## Implementation details

Follow `techspec.md`:

- “System architecture → Component overview”, list of modified backend components.
- “Implementation design → Main interfaces” for `WeatherProvider`, `GetCurrentWeather`, and `normalizeLanguage` signatures.
- “Data models” for `ResolvedLocation`, `WeatherLocation`, `CurrentConditions`, and `WeatherResponse`, including the note about the legacy `condition` field.
- “Data models → `lang` mapping → geocoding language” and “Geocoding API → contract mapping (complement)”.
- “API endpoints → `GET /weather`” for parameters, responses, and examples, including unknown `lang` and country without code.
- “Integration points” for `language` parameter behavior in the Geocoding API.

## Related acceptance criteria

- CA-04
- CA-06
- CA-10
- CA-17

## Task tests

### Unit tests

- [x] TU-BE-10 — Normalizes known, missing, and invalid `lang`
- [x] TU-BE-11 — Passes normalized language to geocoding
- [x] TU-BE-12 — Extracts and normalizes `country_code`
- [x] TU-BE-13 — Includes `weatherCode` alongside `condition` in the contract

### Integration tests

- [x] TI-BE-10 — Returns 200 with `lang=en` and observes the provider
- [x] TI-BE-11 — Ignores invalid `lang` without breaking the contract
- [x] TI-BE-12 — Preserves existing errors with `lang` present

### E2E tests

Not applicable to this task; end-to-end verification occurs in task 2.0.

## Relevant files

To create:

- `backend/src/services/normalize-language.py`
- corresponding `*.test.ts` tests for the new modules

To modify:

- `backend/src/routes/weather-route.py`
- `backend/src/services/get-current-weather.py`
- `backend/src/data/open-meteo-client.py`
- `backend/src/data/parse-geocoding-response.py`
- `backend/src/types/weather-provider.py`
- `backend/src/types/resolved-location.py`
- `backend/src/types/weather-location.py`
- `backend/src/types/current-conditions.py`
- `backend/src/weather-route.test.ts`
- `backend/src/services/weather-services.test.ts`
- `backend/src/data/parsers.test.ts`
- `backend/src/data/open-meteo-client.test.ts`
