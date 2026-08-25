# Task 1.0: Implement the backend for locations and weather via structured selection

## Overview

Implement the contracts, validations, Open-Meteo integration, and endpoints needed to fetch location suggestions and query weather using exactly the location chosen by the user.

<skills>
### Skill compliance

No additional specific skill in `.agents/skills/` is required for the backend. The implementation must comply with `AGENTS.md` and all rules in `.agents/rules/`.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all rules in `.agents/rules/` have been read. The following apply especially:

- maintain the `routes → services → data → types` separation;
- keep TypeScript files up to 100 lines, functions up to 30 lines, and at most three parameters;
- use strict TypeScript, `unknown` at external boundaries, no `any`, no mutation, and strict comparisons;
- use asynchronous operations without blocking the event loop, configurable timeout, centralized logging, and no sensitive data in logs;
- do not add retry, cache, or persistence;
- create automated tests for all new code, following FIRST, AAA, or Given/When/Then, with a minimum coverage of 80%.

There are no planned deviations.
</rules>

<requirements>
- RF1 and RF2: normalize the query and require at least two useful Unicode alphanumeric characters.
- RF4: limit the response to five locations.
- RF5: return city, administrative division when available, country, and coordinates.
- RF8 and RF9: accept structured selection and query weather by exact coordinates, preserving the identity of the selected homonymous location.
- RF11: represent no matches as success with an empty list.
- RF12: normalize failures, timeout, non-success responses, and invalid payloads as location service unavailability.
- Preserve `GET /health` and the existing weather response contract.
- Expose `GET /locations` and replace `GET /weather?city` with `POST /weather`, according to the TechSpec contract.
- Send `Cache-Control: no-store`, do not persist data, and do not expose query, URLs, or internal causes in public errors and logs.
</requirements>

## Subtasks

- [x] 1.1 Define domain types, HTTP contracts, error codes, and the provider interface described in the TechSpec.
- [x] 1.2 Implement query normalization, selected-location validation, safe parsing of `unknown` payloads, and mapping of geocoding results.
- [x] 1.3 Implement `searchLocations`, `SearchLocations`, and `GET /locations`, including fixed parameters, five-item limit, timeout, failure handling, observability, and `no-store`.
- [x] 1.4 Change `GetCurrentWeather` and `POST /weather` to validate the selection and use only its coordinates, removing the text geocoding flow.
- [x] 1.5 Create unit and integration tests with `WeatherProvider` stubbed, without binding a port and without external network.
- [x] 1.6 Run backend tests and coverage, fixing failures without reducing validation criteria.

## Implementation details

Refer to `techspec.md`, especially the sections “System architecture”, “Data models”, “API endpoints”, “Integration points”, “Testing approach”, and “Development sequencing”. Type details, envelopes, messages, Open-Meteo parameters, timeout, logging, and mappings must be treated as the source of truth in the TechSpec, without duplicating contracts outside the appropriate modules.

## Related acceptance criteria

- CA-01
- CA-02
- CA-03
- CA-04
- CA-08
- CA-09
- CA-11

## Task tests

### Unit tests (if applicable)

- [x] TU-BE-01 — Normalizes query and applies the minimum limit
- [x] TU-BE-02 — Maps up to five suggestions and nullable region
- [x] TU-BE-03 — Differentiates empty list from invalid payload
- [x] TU-BE-04 — Searches locations with fixed parameters and timeout
- [x] TU-BE-05 — Validates the selected location
- [x] TU-BE-06 — Queries forecast with exact coordinates

### Integration tests (if applicable)

- [x] TI-BE-01 — Returns up to five locations with `no-store`
- [x] TI-BE-02 — Rejects insufficient query without calling the provider
- [x] TI-BE-03 — Returns empty success
- [x] TI-BE-04 — Normalizes failure from the locations source
- [x] TI-BE-05 — Queries weather for the selected homonymous location
- [x] TI-BE-06 — Rejects invalid selection before forecast

### E2E tests (if applicable)

There are no E2E tests in this task. They will run in task 2 after frontend integration.

## Relevant files

- `tasks/prd-location-autocomplete/prd.md`
- `tasks/prd-location-autocomplete/techspec.md`
- `backend/src/app.py`
- `backend/src/routes/locations-route.py`
- `backend/src/routes/weather-route.py`
- `backend/src/services/normalize-location-query.py`
- `backend/src/services/validate-selected-location.py`
- `backend/src/services/search-locations.py`
- `backend/src/services/get-current-weather.py`
- `backend/src/data/open-meteo-client.py`
- `backend/src/data/parse-geocoding-response.py`
- `backend/src/data/parse-forecast-response.py`
- `backend/src/errors/app-error.py`
- `backend/src/middleware/error-handler.py`
- `backend/src/observability/logger.py`
- `backend/src/types/weather-provider.py`
- `backend/src/types/coordinates.py`
- `backend/src/types/resolved-location.py`
- `backend/src/types/location-suggestion.py`
- `backend/src/types/location-suggestions-response.py`
- Tests `*.test.ts` close to backend modules
- `backend/vitest.config.ts`
