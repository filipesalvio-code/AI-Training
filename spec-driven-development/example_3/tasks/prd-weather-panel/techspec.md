# Technical specification



## Summary

The solution will add `GET /weather?city=...` to the FastAPI backend. The route will validate the city, delegate to an application service to resolve the first location in the Open-Meteo Geocoding API, and then query current conditions in the Weather Forecast API. The backend will validate external responses received as `unknown`, translate the WMO code to English, and return to the frontend a reduced, stable contract ready for display. There will be no database, history, cache, automatic retry, or Open-Meteo calls from the browser.

On the frontend, `App` will compose a weather view without the existing periodic health indicator. The view will use small components, a hook for the query state machine, and a dedicated service for backend access. `GET /health` will remain available on the server as a liveness check. The total budget for both external calls will be 2.5 seconds; external failures will be normalized as temporary unavailability. Deterministic tests will use controlled dependencies, while the CA-09 end-to-end goal will also be measured against real Open-Meteo in QA.



## System architecture

### Component overview

Main flow:

```text
WeatherView
  → useWeatherSearch
    → weatherService
      → GET /weather?city=...
        → weatherRoute
          → getCurrentWeather
            → OpenMeteoClient.searchFirstLocation
            → OpenMeteoClient.getCurrentConditions
          → WeatherResponse
```

New or modified backend components:

- `src/main.py` — modified to load configuration, start the server, and perform idempotent graceful shutdown; it will not contain routes or business rules.
- `src/app.py` — new FastAPI composition, with CORS, parsers, `/health`, `/weather`, and error middleware; it will receive dependencies to allow testing without opening a port.
- `src/config/environment.py` — new reading and validation of `PORT`, `CORS_ORIGIN`, `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL`, and `OPEN_METEO_TIMEOUT_MS`.
- `src/routes/health-route.py` — will extract and preserve the current `GET /health` contract.
- `src/routes/weather-route.py` — will read `city`, apply basic HTTP validation, call the use case, and serialize the response.
- `src/services/normalize-city.py` — will remove excess spaces and validate at least two useful alphanumeric Unicode characters.
- `src/services/get-current-weather.py` — will orchestrate geocoding, selection of the first result, weather query, and assembly of the public contract.
- `src/services/weather-condition.py` — will exhaustively map known WMO codes to English descriptions.
- `src/data/open-meteo-client.py` — will implement both HTTPS calls with native `fetch`, a shared cancellation signal, and fixed parameters.
- `src/data/parse-geocoding-response.py` and `src/data/parse-forecast-response.py` — will validate external payloads before converting them to internal types.
- `src/errors/app-error.py` — will represent expected errors by code and HTTP status.
- `src/middleware/error-handler.py` — will convert expected errors into the public envelope and hide details of unexpected failures.
- `src/observability/logger.py` — will centralize structured logs without recording the searched city.
- `src/types/*.py` — will keep each shared contract in its own file, according to project rules.

New or modified frontend components:

- `src/App.tsx` — modified to compose only the panel experience; it will remove polling and the health indicator.
- `src/views/WeatherView.tsx` — will coordinate form, feedback, and result without direct HTTP access.
- `src/components/WeatherSearchForm.tsx` — will display a labeled field, associated validation, and a button with focus and disabled states.
- `src/components/WeatherFeedback.tsx` — will announce loading, validation, and errors through a live region.
- `src/components/WeatherResult.tsx` — will present location and all current conditions with text labels.
- `src/components/SourceAttribution.tsx` — will display Open-Meteo attribution and license links alongside the result.
- `src/hooks/useWeatherSearch.py` — will maintain a single source of truth for `idle`, `loading`, `success`, and `error`, prevent duplicate submissions, and ignore stale responses after unmount.
- `src/services/weather-service.py` — will be the only frontend module that knows `VITE_API_BASE_URL` and the `GET /weather` contract.
- `src/types/*.py` — will contain, in separate files, response, error, and search state.
- `src/index.css` — will adjust only tokens and base styles that cannot be expressed with Tailwind utilities.
- `index.html` — will define `lang="pt-BR"` and a title consistent with the panel.

Relationships and boundaries:

- The frontend knows only the backend’s public contract.
- The route knows the service, the service knows the provider interface, and the `data` layer implements that interface.
- The Open-Meteo client does not import FastAPI routes, routes, or components.
- No layer persists the city; the response will use `Cache-Control: no-store`.
- The health check will not query external dependencies and will not be displayed in the frontend.



## Implementation design

### Main interfaces

```text
WeatherProvider
  searchFirstLocation(city, signal) -> Promise<ResolvedLocation | null>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>
```

```text
GetCurrentWeather
  execute(city) -> Promise<WeatherResponse>

WeatherService (frontend)
  search(city, signal) -> Promise<WeatherResponse>
```

`GetCurrentWeather` will start a single 2,500 ms budget before geocoding and share the same `AbortSignal` with forecast retrieval. Time spent on the first call will reduce the time available for the second. There will be no automatic retry, as it would increase latency and consumption of the free-tier limit.

### Data models

#### `Coordinates` — internal coordinates of the resolved location

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `latitude` | `number` | yes | Validated WGS84 latitude. |
| `longitude` | `number` | yes | Validated WGS84 longitude. |

```text
{
  "latitude": -23.5475,
  "longitude": -46.6361
}
```

#### `ResolvedLocation` — first valid location returned by geocoding

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | `string` | yes | Localized city name. |
| `administrativeArea` | `string \| null` | yes | First available division in the order `admin1` → `admin2` → `admin3` → `admin4`. |
| `country` | `string` | yes | Localized country. |
| `coordinates` | `Coordinates` | yes | Coordinates used in the forecast. |

```text
{
  "city": "São Paulo",
  "administrativeArea": "São Paulo",
  "country": "Brazil",
  "coordinates": {
    "latitude": -23.5475,
    "longitude": -46.6361
  }
}
```

> **Administrative division degradation:** the absence of all administrative divisions does not invalidate the query; the required public field is normalized to `null`.

```text
{
  "administrativeArea": null
}
```

#### `ProviderConditions` — conditions validated before translation and exposure

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `temperature` | `number` | yes | Temperature in degrees Celsius. |
| `apparentTemperature` | `number` | yes | Feels-like temperature in degrees Celsius. |
| `weatherCode` | `number` | yes | Known integer WMO code. |
| `relativeHumidity` | `number` | yes | Relative humidity between 0 and 100. |
| `windSpeed` | `number` | yes | Non-negative speed in km/h. |

```text
{
  "temperature": 24.3,
  "apparentTemperature": 25.1,
  "weatherCode": 2,
  "relativeHumidity": 72,
  "windSpeed": 12.4
}
```

#### `WeatherLocation` — location ready for the frontend

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | `string` | yes | City effectively selected. |
| `administrativeArea` | `string \| null` | yes | Available administrative division or `null`. |
| `country` | `string` | yes | Country of the location. |

```text
{
  "city": "São Paulo",
  "administrativeArea": "São Paulo",
  "country": "Brazil"
}
```

#### `CurrentConditions` — current data ready for display

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `temperature` | `number` | yes | Current temperature. |
| `apparentTemperature` | `number` | yes | Current feels-like temperature. |
| `condition` | `string` | yes | WMO code description in English. |
| `relativeHumidity` | `number` | yes | Relative humidity. |
| `windSpeed` | `number` | yes | Wind speed. |

```text
{
  "temperature": 24.3,
  "apparentTemperature": 25.1,
  "condition": "Partially cloudy",
  "relativeHumidity": 72,
  "windSpeed": 12.4
}
```

#### `WeatherUnits` — explicit contract units

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `temperature` | `"°C"` | yes | Temperature unit. |
| `apparentTemperature` | `"°C"` | yes | Feels-like temperature unit. |
| `relativeHumidity` | `"%"` | yes | Humidity unit. |
| `windSpeed` | `"km/h"` | yes | Wind speed unit. |

```text
{
  "temperature": "°C",
  "apparentTemperature": "°C",
  "relativeHumidity": "%",
  "windSpeed": "km/h"
}
```

#### `SourceAttribution` — attribution metadata

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `"Open-Meteo"` | yes | Source name. |
| `url` | `string` | yes | Link to Open-Meteo. |
| `license` | `"CC BY 4.0"` | yes | License identifier. |
| `licenseUrl` | `string` | yes | Link to the license terms. |

```text
{
  "name": "Open-Meteo",
  "url": "https://open-meteo.com/",
  "license": "CC BY 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
}
```

#### `WeatherResponse` — aggregated success contract between backend and frontend

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | yes | Resolved location. |
| `current` | `CurrentConditions` | yes | Current conditions. |
| `units` | `WeatherUnits` | yes | Value units. |
| `source` | `SourceAttribution` | yes | Attribution shown with the result. |

```text
{
  "location": {
    "city": "São Paulo",
    "administrativeArea": "São Paulo",
    "country": "Brazil"
  },
  "current": {
    "temperature": 24.3,
    "apparentTemperature": 25.1,
    "condition": "Partially cloudy",
    "relativeHumidity": 72,
    "windSpeed": 12.4
  },
  "units": {
    "temperature": "°C",
    "apparentTemperature": "°C",
    "relativeHumidity": "%",
    "windSpeed": "km/h"
  },
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
  }
}
```

There will be no partial success for current conditions: missing data, invalid type, unexpected unit, or unknown WMO code will produce `WEATHER_SERVICE_UNAVAILABLE`, since all fields are required in a successful query.

#### `ApiError` — error envelope

| Code | HTTP | Meaning |
| --- | --- | --- |
| `INVALID_CITY` | `400` | Missing or repeated parameter, or fewer than two alphanumeric Unicode characters after normalization. |
| `CITY_NOT_FOUND` | `404` | Valid geocoding with no matching location. |
| `WEATHER_SERVICE_UNAVAILABLE` | `503` | Timeout, network failure, rate limit, non-success status, or invalid payload from any external dependency. |
| `INTERNAL_ERROR` | `500` | Unexpected server error, without exposing internal details. |

```text
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "City not found. Please check the name and try again."
  }
}
```

Public messages will be stable and in English. Stack traces, external URL, raw Open-Meteo reason, and error details will remain only in server logs.

#### Geocoding API → contract mapping

| Source (Open-Meteo) | Target (contract) |
| --- | --- |
| `results[0].name` | `location.city` |
| first non-empty value among `admin1`, `admin2`, `admin3`, `admin4` | `location.administrativeArea` |
| `results[0].country` | `location.country` |
| `results[0].latitude` | internal `coordinates.latitude` |
| `results[0].longitude` | internal `coordinates.longitude` |

#### Weather Forecast API → contract mapping

| Source (Open-Meteo) | Target (contract) |
| --- | --- |
| `current.temperature_2m` | `current.temperature` |
| `current.apparent_temperature` | `current.apparentTemperature` |
| `current.weather_code` | translation → `current.condition` |
| `current.relative_humidity_2m` | `current.relativeHumidity` |
| `current.wind_speed_10m` | `current.windSpeed` |
| validated `current_units.*` | normalized `units.*` |

#### WMO code mapping → English

| Codes | Public description |
| --- | --- |
| `0` | Clear sky |
| `1`, `2`, `3` | Mainly clear, partly cloudy, overcast |
| `45`, `48` | Fog, depositing rime fog |
| `51`, `53`, `55` | Light, moderate, heavy drizzle |
| `56`, `57` | Light, heavy freezing drizzle |
| `61`, `63`, `65` | Slight, moderate, heavy rain |
| `66`, `67` | Light, heavy freezing rain |
| `71`, `73`, `75` | Slight, moderate, heavy snow |
| `77` | Snow grains |
| `80`, `81`, `82` | Slight, moderate, violent rain showers |
| `85`, `86` | Slight, heavy snow showers |
| `95` | Thunderstorm |
| `96`, `99` | Thunderstorm with slight, heavy hail |

#### Fixed parameters at the source

| API | Main parameters |
| --- | --- |
| **Geocoding API** | `name=<normalized city>`, `count=1`, `language=pt`, `format=json` |
| **Weather Forecast API** | `latitude=<lat>`, `longitude=<lon>`, `current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`, `temperature_unit=celsius`, `wind_speed_unit=kmh` |

There is no database schema. The city exists only in the controlled frontend field, in the in-flight request, and in the memory required to respond; no history functionality will be created.

### API Endpoints (if applicable)

#### Overview

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/weather` | Resolves a city and returns its current conditions. |
| `GET` | `/health` | Preserves the current backend liveness check. |

---

#### `GET /weather`

Resolves the first location returned by Open-Meteo and aggregates its current conditions. Because it is an idempotent read, it does not require an idempotency key.

**Query parameters**

| Parameter | Type | Default | Rules |
| --- | --- | --- | --- |
| `city` | `string` | — | Required and unique; `trim`, collapse internal spaces, and at least two alphanumeric Unicode characters. |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `WeatherResponse` | First location and current conditions were validated. |
| `400` | `ApiError` | `city` is missing, repeated, or invalid. |
| `404` | `ApiError` | There is no matching location. |
| `503` | `ApiError` | An external dependency does not complete successfully within the total budget. |
| `500` | `ApiError` | An unexpected internal failure occurs. |

**Example — success**

```http
GET /weather?city=S%C3%A3o%20Paulo
```

The body is the `WeatherResponse` example documented in “Data models”. The response will include `Cache-Control: no-store`.

**Example — no match**

```http
GET /weather?city=CidadeInexistente
```

```text
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "City not found. Please check the name and try again."
  }
}
```

> The frontend will clear any previous result when a new attempt starts. A `404` or `503` response will never be displayed alongside data from the previous search.

**Example — validation error**

```http
GET /weather?city=%20a%20
```

```text
{
  "error": {
    "code": "INVALID_CITY",
    "message": "Please provide a city with at least two characters."
  }
}
```

**Example — external unavailability**

```text
{
  "error": {
    "code": "WEATHER_SERVICE_UNAVAILABLE",
    "message": "Unable to fetch the weather right now. Please try again shortly."
  }
}
```

---

#### `GET /health`

Preserves the existing endpoint as a local process check, without querying Open-Meteo.

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ status: "healthy", timestamp: string }` | The FastAPI process is ready to respond. |

**Example — success**

```http
GET /health
```

```text
{
  "status": "healthy",
  "timestamp": "2026-08-02T15:00:00.000Z"
}
```

The endpoint will be preserved for infrastructure, but the frontend will not poll it or display its indicator.

---

## Integration points

- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search`; uses the first result with `count=1` and name localization with `language=pt`. The response may omit administrative fields, which will be normalized. Reference: [official geocoding documentation](https://open-meteo.com/en/docs/geocoding-api).
- **Weather Forecast API:** `https://api.open-meteo.com/v1/forecast`; requests only the five required current variables and metric units. Reference: [official forecast documentation](https://open-meteo.com/en/docs).
- **Authentication:** the MVP does not use an API key, assuming the free non-commercial service. URLs remain configurable to allow migration to the commercial endpoint without changing business rules.
- **Timeout:** a single `AbortController` limits the geocoding → forecast chain to 2,500 ms. Timeout, DNS/TLS error, `429`, other non-success responses, invalid JSON, or missing required field all converge to `503 WEATHER_SERVICE_UNAVAILABLE`.
- **Retry and cache:** there will be no retry or cache in the MVP. This keeps latency predictable, avoids associating stale responses with a new query, and reduces complexity. The decision should be revisited if volume or SLO justifies ephemeral cache.
- **Limits and license:** before each release, free plan limits must be rechecked in the [official terms](https://open-meteo.com/en/terms). On August 2, 2026, the page states non-commercial use and limits below 600 calls/minute, 5,000/hour, 10,000/day, and 300,000/month. Since a successful search uses two calls, monitoring must consider both. Attribution will follow the [official license](https://open-meteo.com/en/licence) and remain visible next to the data.



## Testing approach

Vitest will be configured separately in the frontend and backend, with minimum thresholds of 80% for lines, functions, branches, and statements. Tests will follow FIRST and AAA or Given/When/Then. External network will be replaced by deterministic stubs; only boundary mocks will be used. Playwright will live in `e2e/` as an independent test project and will cover a few critical flows. `npm test` will be created in both apps and will fail when the suite fails; `test:coverage` will enforce thresholds.

### Unit tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TU-BE-01 | Normalizes spaces and accepts valid international names | CA-01, CA-05 | The normalized city preserves Unicode characters and can proceed to lookup. |
| TU-BE-02 | Rejects missing city or city with fewer than two meaningful characters | CA-05 | Returns `INVALID_CITY` without calling the provider. |
| TU-BE-03 | Selects only the first geocoding result | CA-01, CA-02 | The service uses the first coordinate and does not create a selection step. |
| TU-BE-04 | Normalizes missing administrative division | CA-02 | `administrativeArea` is the first available level or `null`. |
| TU-BE-05 | Maps forecast fields and units | CA-01, CA-03 | The contract contains all required values in °C, %, and km/h. |
| TU-BE-06 | Translates all known WMO codes | CA-03 | Each code produces the specified pt-BR description. |
| TU-BE-07 | Rejects invalid external payload or unknown code | CA-07 | The use case fails as `WEATHER_SERVICE_UNAVAILABLE`. |
| TU-BE-08 | Ends both calls within total budget without retry | CA-07, CA-09 | The signal is aborted at 2,500 ms and each operation occurs at most once. |
| TU-FE-01 | Validates city before calling the service | CA-05 | Shows field-associated guidance, clears result, and does not make a request. |
| TU-FE-02 | Models loading and blocks duplicate submission | CA-08 | Form stays busy and a second action does not start a new call. |
| TU-FE-03 | Presents full success and attribution | CA-01, CA-02, CA-03, CA-13 | Location, five conditions, units, and links are visible. |
| TU-FE-04 | Presents city not found and allows retry | CA-06 | Actionable message is displayed and the field becomes operable again. |
| TU-FE-05 | Clears previous result after external failure | CA-07 | No old data remains; a new submission can be made. |
| TU-FE-06 | Exposes async states through accessible semantics | CA-10, CA-11 | Labels, `aria-invalid`, `aria-describedby`, `role=status/alert`, and `aria-busy` reflect state. |

The backend will test parsers with `unknown` objects, numeric boundaries, omitted fields, empty arrays, external statuses, and abort handling. The frontend will use Testing Library, `user-event`, and `jest-dom`, querying by roles and accessible names instead of CSS classes.

### Integration tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TI-BE-01 | Returns the 200 contract and sends minimum parameters to Open-Meteo | CA-01, CA-02, CA-03 | TestClient receives `WeatherResponse`; the stub observes `count=1`, `language=pt`, current variables, and metric units. |
| TI-BE-02 | Rejects invalid query without external access | CA-05 | `GET /weather` returns stable 400 and the stub is not called. |
| TI-BE-03 | Converts empty geocoding into 404 | CA-06 | Forecast is not called and the envelope contains `CITY_NOT_FOUND`. |
| TI-BE-04 | Normalizes failures from both APIs into 503 | CA-07 | Network, timeout, `429`, `5xx`, and invalid JSON produce the same public contract. |
| TI-BE-05 | Preserves isolated health check | — | `/health` returns the current contract and does not call the provider. |
| TI-FE-01 | Integrates hook, service, and components across the four states | CA-05, CA-06, CA-07, CA-08 | UI transitions between idle, loading, success, and error without contradictory data. |

Backend tests will build the app with a `WeatherProvider` stub and FastAPI TestClient, without binding a port and without real network. Frontend tests will replace only `fetch` at the service boundary.
### E2E Tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| E2E-01 | Search for a city and display the first complete result | CA-01, CA-02, CA-03, CA-13 | The user sees location, values, units, and a functional attribution. |
| E2E-02 | Ensure the browser does not call Open-Meteo | CA-04 | The network capture contains only frontend and backend; any Open-Meteo host fails the test. |
| E2E-03 | Correct invalid input without making a request | CA-05 | The message appears, receives focus/association, and no search is sent. |
| E2E-04 | Recover from city not found | CA-06 | The user changes the city and completes a new query. |
| E2E-05 | Clear previous success after unavailability and allow retry | CA-07 | The previous data disappears, the message is announced, and retry can succeed. |
| E2E-06 | Display loading and prevent duplicate submission | CA-08 | A controlled pending response keeps feedback visible and only one request is sent. |
| E2E-07 | Operate via keyboard and announce state changes | CA-10, CA-11 | Focus order, visible focus, keyboard submission, and live regions work without mouse or color. |
| E2E-08 | Keep layout usable at 360 px and 1280 px | CA-12 | There is no horizontal overflow and content/controls remain readable. |
| E2E-09 | Measure the end-to-end query budget | CA-09 | In controlled automation and in the real QA run, at least 95% of samples display the result within 3 s. |

In CI, E2E-09 will use controlled responses to isolate application overhead and remain repeatable. In QA, before release, the same flow will run on at least 20 queries distributed across cities from different languages and regions, with Open-Meteo available and without artificial throttling. Time will be measured from form submission to result visibility; p95, sample size, date, and network conditions will be attached to the QA report. The real run will not block the deterministic suite due to provider unavailability, but CA-09 will prevent functional approval if the observed p95 exceeds 3 seconds without justification and reassessment.



## Development sequencing

### Build order

1. Set up Vitest, 80% coverage, and `test`/`test:coverage` scripts in both applications; create the Playwright project in `e2e/`. This establishes required validation before functional code.
2. Extract `app.ts`, `/health`, error handler, logger, and initialization/graceful shutdown, preserving existing behavior and eliminating current unused-parameter errors.
3. Define types, errors, environment configuration, and the `WeatherProvider` interface, locking the contract before integrations.
4. Implement normalization, WMO translation, and use case with unit tests.
5. Implement and test the Open-Meteo client and its parsers with stubs, single timeout, and no retry.
6. Expose and test `GET /weather` with FastAPI TestClient.
7. Create frontend types and HTTP service using `VITE_API_BASE_URL`.
8. Implement `useWeatherSearch`, components, and `WeatherView` with interaction and accessibility tests; replace the placeholder and remove the health indicator.
9. Add critical E2E tests, validate 360/1280 px, and run controlled performance measurement.
10. Run lint, typecheck, builds, tests, coverage, and the real performance run in QA.

### Technical dependencies

- Backend: add `vitest`, `@vitest/coverage-v8`, `supertest`, and `@types/supertest` as development dependencies. Native Node `fetch` will be reused; no SDK or HTTP client will be added.
- Frontend: add `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom` as development dependencies.
- E2E: create `e2e/package.json`, `e2e/package-lock.json`, Playwright configuration, and dependency `@playwright/test`, without creating a root `package.json`.
- Update lockfiles with npm and keep the three installations independent.
- Create `backend/.env.example` with public URLs, timeout, CORS, and port; create `frontend/.env.example` with `VITE_API_BASE_URL`.
- Open-Meteo availability is required only for real use and QA performance; common automated tests do not depend on it.
- There is no migration, database, credential, or persistence infrastructure.



## Monitoring and observability

- Keep `GET /health` as local liveness, without turning Open-Meteo failure into process failure.
- Generate a `requestId` per request and JSON logs for events `weather_query_completed`, `weather_provider_failed`, and `unexpected_error`.
- Log at `info` level for result `success`, `not_found`, or `invalid`, with route, status, total duration, and dependency durations.
- Log at `error` level for timeout, network failure, invalid external response, and unexpected error, including dependency and sanitized cause.
- Do not log city text, external response body, IP, or other unnecessary data. Observability will not be used as product history.
- Use browser end-to-end duration in QA for CA-09. Backend duration logs help separate internal latency, geocoding, and forecast; a metrics system will not be introduced in this MVP.
- Alerts and dashboards are out of scope until collection infrastructure exists, but stable event names and fields will allow future aggregation of error rate, p95, and estimated usage.



## Technical considerations

### Key decisions

- **GET endpoint with query:** represents idempotent read, is easy to inspect, and keeps city name as the only public input.
- **First result in the backend:** applies RF3 in one place and prevents the frontend from depending on external geocoding format.
- **Display-ready contract:** the frontend receives descriptions, units, normalized location, and attribution, without interpreting WMO codes or external fields.
- **Validation on both sides:** the frontend provides immediate feedback; the backend remains authoritative and never trusts the query.
- **Single 2.5 s budget:** reserves about 500 ms for transport and rendering within the 3 s target and prevents two independent timeouts from adding past the SLO.
- **Single 503 for external failure:** simplifies client recovery without hiding cause in logs. `404` remains exclusive to missing locality.
- **No partial success:** the five weather data points are mandatory per the PRD; incomplete payload cannot look like a completed query.
- **No retry and cache in MVP:** reduces complexity, tail latency, and stale-data risk. Exponential retry and TTL cache alternatives were discarded at this stage.
- **Native `fetch` and existing libraries:** avoids unnecessary SDK; current React, FastAPI, Tailwind, and utilities are sufficient.
- **Health indicator removed from frontend:** decision confirmed by the user; `/health` remains infrastructure-only.
- **Deterministic performance + real QA:** decision confirmed by the user; CI measures the app with controlled dependencies and QA measures the real provider.

### Known risks

- Two sequential external calls make p95 dependent on Open-Meteo. Mitigation: single budget, minimal payload, no retry, and step-by-step measurement.
- The free plan has limits and non-commercial use. Mitigation: log `429` failures, do not poll/retry, and revalidate terms and volume before releases.
- The first result may not represent user intent for homonymous names. Mitigation: display city, administrative division, and country; manual selection is out of scope.
- External fields may be omitted or change optionally. Mitigation: validate as `unknown`, normalize only administrative division to `null`, and fail safely on required data.
- New WMO codes may emerge. Mitigation: exhaustive tested mapping and fallback as invalid external response, never a misleading description.
- Duplication of city validation between frontend and backend may diverge. Mitigation: single normalization specification and equivalent cases in both suites.
- The project still has no CI or aggregated observability. Mitigation: reproducible scripts, local coverage, and structured logs; pipeline automation remains outside this feature.
- The real CA-09 run is not perfectly repeatable. Mitigation: separate blocking controlled test from real QA evidence and record sample conditions.
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were read in full: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `python.md`, and `tests.md`.

- Frontend and backend remain independent applications, with dependencies and commands executed in their own directories.
- The backend will follow `routes → services → data`; the frontend will follow `view → components/hooks → services → backend`.
- `.ts` files will have a maximum of 100 lines, functions a maximum of 30 lines, up to three parameters, explicit typing, no `any`, guard clauses, and ES imports consistent with each application.
- Each shared type will live in its own file; React components will have a single responsibility and a maximum of 30 lines, requiring the listed extractions.
- Variable URLs and timeouts will be configured by environment with versionable examples, without secrets.
- The server will use `async/await`, non-blocking `fetch`, centralized logging, and idempotent graceful shutdown.
- All new code will have automated tests; Vitest, Playwright, pyramid, FIRST, and minimum 80% coverage will be applied.
- Before implementation is considered complete, the following must pass: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` on the frontend; `npm run build`, `npm test`, and `npm run test:coverage` on the backend; and the `e2e/` project suite.
- The current backend build, broken by unused parameters, will be fixed by extracting and typing handlers, without suppressing `noUnusedParameters`.
- Comments will not be added to the code except when absolutely necessary; structure and naming should express intent.

### Compliance with skills

- `create-techspec` — fully applied: PRD analyzed, project explored with the Explore agent before questions, assumptions confirmed, template preserved, and specification without implementation.
- `react` — applicable to the frontend. The architecture separates HTTP access, hook, and presentation; uses small components and explicit props, non-redundant state, effects only for external boundaries/cleanup, no premature memoization, HTML semantics, live regions, visible focus, and Tailwind. There is no planned deviation. The existing generic `Button` will not be necessary for the form and will not be changed as part of this feature.

### Relevant and dependent files

Existing files to modify:

- `backend/src/main.py`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/index.html`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`

Backend files to create:

- `backend/.env.example`
- `backend/vitest.config.ts`
- `backend/src/app.py`
- `backend/src/config/environment.py`
- `backend/src/routes/health-route.py`
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
- `*.test.ts` tests next to the corresponding modules.

Frontend files to create:

- `frontend/.env.example`
- `frontend/vitest.config.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.py`
- `frontend/src/types/weather-response.py`
- `frontend/src/types/api-error.py`
- `frontend/src/types/weather-search-state.py`
- `*.test.ts` and `*.test.tsx` tests next to the corresponding modules.

E2E files to create:

- `e2e/package.json`
- `e2e/package-lock.json`
- `e2e/playwright.config.ts`
- `e2e/weather-panel.spec.ts`
