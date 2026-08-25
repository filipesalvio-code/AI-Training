# Task 2.0: Implement the complete weather query in the backend

## Overview

Deliver `GET /weather?city=...` end-to-end in the backend: city validation, resolving the first location, querying current conditions, WMO translation, public contract, integration resilience, and tested HTTP responses.

<skills>
### Skills compliance

- `execute-task`: use it to implement this task after completing task 1 and update its status only after all validations pass.
- There is no specific backend technical skill in `.agents/skills/`; fully apply the Python/FastAPI, JavaScript/TypeScript frontend, structure, and testing rules.
</skills>

<rules>
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were considered.

- Maintain the `routes → services → data` direction, keeping HTTP validation and serialization in the route and business rules in services.
- Use native `fetch` and `async/await`, with no synchronous I/O, retry, cache, or event loop blocking.
- Validate received external responses as `unknown`; do not use `any` or trust external payloads.
- Keep each shared type in its own file and respect limits for files, functions, and parameters.
- Use constants for codes, units, timeout, and other domain values; prefer guard clauses and immutable structures.
- Do not log the city, external bodies, IP, public stack trace, or sensitive details.
- Test rules with unit tests and HTTP contracts with integration tests using deterministic stubs, without real network access.
- Update dependencies only with npm and preserve the backend lockfile.
- There is no planned deviation from the rules.
</rules>

<requirements>
- RF2: validate the normalized city, requiring at least two useful Unicode alphanumeric characters.
- RF3 and RF4: select only the first result and return city, first available administrative division or `null`, and country.
- RF5 and RF6: integrate Open-Meteo geocoding and current forecast over HTTPS.
- RF7 and RF8: expose to the frontend only the backend’s reduced contract, including location, conditions, units, and source.
- RF9 to RF12: deliver temperature, feels-like, condition in pt-BR, humidity, and wind in the defined metric units.
- RF14: differentiate `INVALID_CITY`, `CITY_NOT_FOUND`, `WEATHER_SERVICE_UNAVAILABLE`, and `INTERNAL_ERROR` by stable status and envelope.
- RF17: include attribution metadata to Open-Meteo and the license in the success contract.
- Share a single 2,500 ms budget between geocoding and forecast, abort the chain when exhausted, and do not perform retries.
- Treat as unavailability any non-success external status, timeout, network failure, invalid JSON, unexpected unit, missing required field, invalid numeric limit, or unknown WMO code.
- Return `Cache-Control: no-store`, do not persist searches, and keep `/health` isolated.
- Emit the specified observability events and durations without logging the city text.
</requirements>

## Subtasks

- [x] 2.1 Define public and internal types, the `WeatherProvider` interface, and the expected query errors.
- [x] 2.2 Implement city normalization, administrative resolution, WMO translation, and the `GetCurrentWeather` use case.
- [x] 2.3 Implement and test geocoding and forecast parsers for `unknown` inputs.
- [x] 2.4 Implement the Open-Meteo client with minimal parameters, configurable URLs, shared signal, total timeout, and no automatic retries.
- [x] 2.5 Implement and register the `/weather` route, headers, and HTTP error normalization.
- [x] 2.6 Implement the eight backend unit cases with stubs and a controlled clock.
- [x] 2.7 Implement the four `/weather` integration cases with FastAPI TestClient and controlled dependencies.
- [x] 2.8 Run backend build, tests, and coverage, confirming the minimum 80% threshold.

## Implementation details

Follow `techspec.md`, especially “Main interfaces,” “Data models,” Geocoding, Forecast, and WMO mappings, “Fixed source parameters,” “GET /weather,” “Integration points,” “Monitoring and observability,” and “Main decisions.” Do not duplicate types or rules outside the layers indicated in the specification.

## Related acceptance criteria

- CA-01
- CA-02
- CA-03
- CA-05
- CA-06
- CA-07
- CA-09
- CA-13

## Task tests

### Unit tests

- [ ] TU-BE-01 — Normalizes spaces and accepts valid international names
- [ ] TU-BE-02 — Rejects missing city or city with fewer than two useful characters
- [ ] TU-BE-03 — Selects only the first geocoding result
- [ ] TU-BE-04 — Normalizes missing administrative division
- [ ] TU-BE-05 — Maps forecast fields and units
- [ ] TU-BE-06 — Translates all known WMO codes
- [ ] TU-BE-07 — Rejects invalid external payload or unknown code
- [ ] TU-BE-08 — Ends both calls within the total budget without retry

### Integration tests

- [ ] TI-BE-01 — Returns the 200 contract and sends minimal parameters to Open-Meteo
- [ ] TI-BE-02 — Rejects invalid query without external access
- [ ] TI-BE-03 — Converts empty geocoding into 404
- [ ] TI-BE-04 — Normalizes failures from both APIs into 503

## Relevant files

- `backend/src/app.py`
- `backend/src/config/environment.py`
- `backend/src/routes/weather-route.py`
- `backend/src/services/normalize-city.py`
- `backend/src/services/get-current-weather.py`
- `backend/src/services/weather-condition.py`
- `backend/src/data/open-meteo-client.py`
- `backend/src/data/parse-geocoding-response.py`
- `backend/src/data/parse-forecast-response.py`
- `backend/src/errors/app-error.py`
- `backend/src/middleware/error-handler.py`
- `backend/src/observability/logger.py`
- `backend/src/types/coordinates.py`
- `backend/src/types/resolved-location.py`
- `backend/src/types/provider-conditions.py`
- `backend/src/types/weather-location.py`
- `backend/src/types/current-conditions.py`
- `backend/src/types/weather-units.py`
- `backend/src/types/source-attribution.py`
- `backend/src/types/weather-response.py`
- `backend/src/types/api-error.py`
- `backend/src/types/weather-provider.py`
- Tests `*.test.ts` near the corresponding modules
