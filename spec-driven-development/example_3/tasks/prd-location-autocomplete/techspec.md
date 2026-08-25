# Technical specification



## Summary

The solution will add `GET /locations?query=...` to the backend to return up to five locations from Open-Meteo’s Geocoding API. The frontend will call this endpoint after 200 ms without new edits, cancel obsolete requests, and present the results in an accessible combobox. There will be no new libraries, caching, retries, persistence, or direct browser calls to Open-Meteo.

When a suggestion is selected, the frontend will send the structured location to `POST /weather`. The backend will validate city, region, country, and coordinates, and directly query the forecast for the chosen coordinates. This contract will replace `GET /weather?city=...`, eliminating the new geocoding step that could pick a different city with the same name. The weather response contract will remain unchanged.



## System architecture

### Component overview

Suggestion flow:

```text
LocationAutocomplete
  → useLocationSuggestions (debounce de 200 ms)
    → locationService
      → GET /locations?query=...
        → locationsRoute
          → SearchLocations
            → OpenMeteoClient.searchLocations
          → LocationSuggestionsResponse
```

Selection and weather flow:

```text
LocationAutocomplete
  → WeatherView.onLocationSelect
    → useWeatherSearch
      → weatherService
        → POST /weather { location }
          → weatherRoute
            → GetCurrentWeather
              → OpenMeteoClient.getCurrentConditions
            → WeatherResponse
```

New or modified backend components:

- `src/app.py` — will register `GET /locations` and replace registration of the old weather query with `POST /weather`, while keeping provider injection for tests.
- `src/routes/locations-route.py` — new handler that will perform basic HTTP validation of `query`, apply `Cache-Control: no-store`, and delegate to the use case.
- `src/routes/weather-route.py` — will start receiving the structured body of the selected location and delegate its validation to the service.
- `src/services/normalize-location-query.py` — will replace the city-specific concept, normalizing spaces and requiring two useful alphanumeric Unicode characters.
- `src/services/validate-selected-location.py` — will validate required text fields, nullable administrative division, and WGS84 coordinate bounds of the received coordinates, returning a trusted `LocationSuggestion`.
- `src/services/search-locations.py` — new use case that will control timeout, call the provider, limit to five results, and build the public contract.
- `src/services/get-current-weather.py` — will stop geocoding text and query conditions by the validated coordinates from the selection.
- `src/data/open-meteo-client.py` — will replace `searchFirstLocation` with `searchLocations`, using `count=5`; the existing forecast query will be preserved.
- `src/data/parse-geocoding-response.py` — will validate and map a list of up to five locations, instead of only the first item.
- `src/types/weather-provider.py` — will reflect the `searchLocations` and `getCurrentConditions` operations.
- `src/types/location-suggestion.py` — new public contract for a suggestion.
- `src/types/location-suggestions-response.py` — new public list envelope.
- `src/errors/app-error.py` — will add specific codes and messages for query, selection, and location unavailability.
- `src/observability/logger.py` — will accept suggestion-search events and context without logging the searched text.

New or modified frontend components:

- `src/views/WeatherView.tsx` — will coordinate the controlled query, the selected suggestion, and immediate startup of the weather query. Selecting will fill the field and suspend new suggestions until the next user edit.
- `src/components/LocationAutocomplete.tsx` — new combobox that will compose input, feedback, and list while keeping DOM focus on the field.
- `src/components/LocationSuggestionsList.tsx` — new semantic list with options and active highlight.
- `src/components/LocationSuggestionFeedback.tsx` — new feedback for loading, empty list, and unavailability.
- `src/hooks/useLocationSuggestions.py` — new hook responsible for debounce, async states, cancellation, and protection against out-of-order responses.
- `src/hooks/useComboboxNavigation.py` — new local interaction hook to open, close, navigate, and select options without mixing HTTP access into the component.
- `src/services/location-service.py` — new client and parser for `GET /locations`.
- `src/hooks/useWeatherSearch.py` — will receive a `LocationSuggestion` instead of free text.
- `src/services/weather-service.py` — will call `POST /weather` with a JSON body and keep validation of the existing `WeatherResponse`.
- `src/types/location-suggestion.py` — new contract shared with the interface.
- `src/types/location-search-state.py` — new discriminated union of suggestion states.
- `src/types/api-error.py` — will include the new public codes.
- `src/components/WeatherSearchForm.tsx` — will be removed; selection in the combobox will replace the input field and submit button.

Relationships and boundaries:

- The frontend will know only the backend’s HTTP contracts.
- Views and components will not use `fetch`; access will stay in `services` and async states in hooks.
- Routes will depend on services, services will depend on the provider interface, and `data` will implement that interface.
- The backend will not store suggestions or selected locations.
- Focus will remain on the input during navigation; the active item will be communicated via `aria-activedescendant`.
- `GET /health` and the weather response contract will not be changed.



## Implementation design

### Main interfaces

```text
WeatherProvider
  searchLocations(query, signal) -> Promise<ResolvedLocation[]>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>
```

```text
SearchLocations
  execute(query) -> Promise<LocationSuggestionsResponse>

GetCurrentWeather
  execute(location) -> Promise<WeatherResponse>
```

```text
LocationService (frontend)
  searchLocations(query, signal) -> Promise<LocationSuggestion[]>

WeatherService (frontend)
  searchWeather(location, signal) -> Promise<WeatherResponse>
```

```text
useLocationSuggestions(query, enabled)
  -> { state, dismiss }

useWeatherSearch()
  -> { state, search(location) }
```
### Data models

#### `Coordinates` — WGS84 coordinates of the location

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `latitude` | `number` | yes | Finite number between `-90` and `90`. |
| `longitude` | `number` | yes | Finite number between `-180` and `180`. |

```text
{
  "latitude": -23.5475,
  "longitude": -46.6361
}
```

#### `ResolvedLocation` — validated internal location from Open-Meteo

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | `string` | yes | Localized, non-empty name. |
| `administrativeArea` | `string \| null` | yes | First available value among `admin1`, `admin2`, `admin3`, and `admin4`. |
| `country` | `string` | yes | Localized, non-empty country. |
| `coordinates` | `Coordinates` | yes | Validated coordinates. |

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

> **Administrative division degradation:** if all administrative levels are missing, `administrativeArea` will be `null`; the other fields remain required.

```text
{
  "administrativeArea": null
}
```

#### `LocationSuggestion` — suggestion ready for display and selection

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | `string` | yes | City shown as the primary text. |
| `administrativeArea` | `string \| null` | yes | State or region, when available. |
| `country` | `string` | yes | Country shown for disambiguation. |
| `coordinates` | `Coordinates` | yes | Coordinates used after selection. |

```text
{
  "city": "Springfield",
  "administrativeArea": "Illinois",
  "country": "United States",
  "coordinates": {
    "latitude": 39.8017,
    "longitude": -89.6436
  }
}
```

#### `LocationSuggestionsResponse` — success envelope for location search

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `suggestions` | `LocationSuggestion[]` | yes | Provider-ordered list, limited to five items. |

```text
{
  "suggestions": [
    {
      "city": "Springfield",
      "administrativeArea": "Illinois",
      "country": "United States",
      "coordinates": {
        "latitude": 39.8017,
        "longitude": -89.6436
      }
    }
  ]
}
```

> **Empty list:** no matches is a success, not an error.

```text
{
  "suggestions": []
}
```

#### `WeatherRequest` — weather query body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `location` | `LocationSuggestion` | yes | Suggestion chosen in the combobox. |

```text
{
  "location": {
    "city": "Springfield",
    "administrativeArea": "Illinois",
    "country": "United States",
    "coordinates": {
      "latitude": 39.8017,
      "longitude": -89.6436
    }
  }
}
```

#### `WeatherResponse` — existing and unchanged weather response

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | yes | Selected city, nullable administrative division, and country. |
| `current` | `CurrentConditions` | yes | Temperature, feels-like, condition, humidity, and wind. |
| `units` | `WeatherUnits` | yes | Metric units already displayed by the dashboard. |
| `source` | `SourceAttribution` | yes | Existing Open-Meteo attribution. |

```text
{
  "location": {
    "city": "Springfield",
    "administrativeArea": "Illinois",
    "country": "United States"
  },
  "current": {
    "temperature": 18.4,
    "apparentTemperature": 17.9,
    "condition": "Partially cloudy",
    "relativeHumidity": 64,
    "windSpeed": 11.2
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
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
  }
}
```

#### `LocationSearchState` — suggestion search states in the frontend

| Variant | Fields | Description |
| --- | --- | --- |
| `idle` | `status` | Field inactive, insufficient, or list dismissed. |
| `loading` | `status`, `query` | Debounce completed and current request in progress. |
| `success` | `status`, `query`, `suggestions` | Current response, including an empty list. |
| `error` | `status`, `query`, `error` | Current search failure ready for feedback. |

```text
{
  "status": "success",
  "query": "spri",
  "suggestions": []
}
```

#### `ApiError` — error envelope

| Code | HTTP | Meaning |
| --- | --- | --- |
| `INVALID_LOCATION_QUERY` | `400` | `query` is missing, repeated, or has fewer than two meaningful characters. |
| `LOCATION_SERVICE_UNAVAILABLE` | `503` | Timeout, network, non-success status, or invalid payload in location search. |
| `INVALID_LOCATION` | `400` | Selection body missing or containing invalid text/coordinates. |
| `WEATHER_SERVICE_UNAVAILABLE` | `503` | Timeout, network, non-success status, or invalid payload in forecast. |
| `INTERNAL_ERROR` | `500` | Unexpected failure with no internal details in the body. |

```text
{
  "error": {
    "code": "LOCATION_SERVICE_UNAVAILABLE",
    "message": "Unable to fetch locations right now. Please try again."
  }
}
```

Public messages will be stable and in English. Open-Meteo responses, URLs, queries, and internal causes will not be exposed to the client.

#### Geocoding API → contract mapping

| Source (Open-Meteo) | Target (contract) |
| --- | --- |
| `results[].name` | `suggestions[].city` |
| first non-empty text among `admin1`, `admin2`, `admin3`, `admin4` | `suggestions[].administrativeArea` |
| `results[].country` | `suggestions[].country` |
| `results[].latitude` | `suggestions[].coordinates.latitude` |
| `results[].longitude` | `suggestions[].coordinates.longitude` |

The envelope without `results`, and any item among the five returned without valid city, country, or coordinates, will be treated as external unavailability. `results: []` will be preserved as an empty list.

#### Selection → forecast and response mapping

| Source (`WeatherRequest`) | Target |
| --- | --- |
| `location.coordinates.latitude` | forecast `latitude` parameter |
| `location.coordinates.longitude` | forecast `longitude` parameter |
| `location.city` | `WeatherResponse.location.city` |
| `location.administrativeArea` | `WeatherResponse.location.administrativeArea` |
| `location.country` | `WeatherResponse.location.country` |

#### Fixed parameters at the source

| API | Main parameters |
| --- | --- |
| **Geocoding API** | `name=<normalized query>`, `count=5`, `language=pt`, `format=json` |
| **Weather Forecast API** | `latitude=<lat>`, `longitude=<lon>`, `current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`, `temperature_unit=celsius`, `wind_speed_unit=kmh` |

There will be no database. Query, suggestions, and selection will exist only in the current interface state and during the required requests.
### API Endpoints (if applicable)

#### Overview

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/locations` | Fetches up to five global location suggestions. |
| `POST` | `/weather` | Queries weather by the coordinates of the selected location. |
| `GET` | `/health` | Preserves the backend liveness check. |

---

#### `GET /locations`

Fetches suggestions ordered by Open-Meteo. The operation is idempotent and does not persist the query.

**Query parameters**

| Parameter | Type | Default | Rules |
| --- | --- | --- | --- |
| `query` | `string` | — | Required and unique; applies `trim`, collapses internal spaces, and requires two useful Unicode alphanumeric characters. |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `LocationSuggestionsResponse` | The source returns zero to five valid locations. |
| `400` | `ApiError` | `query` is missing, duplicated, or invalid. |
| `503` | `ApiError` | The source fails, exceeds timeout, or returns an invalid payload. |
| `500` | `ApiError` | An unexpected internal failure occurs. |

**Example — success**

```http
GET /locations?query=spri
```

The body is the `LocationSuggestionsResponse` example documented in “Data models.” The response will include `Cache-Control: no-store`.

**Example — no match**

```http
GET /locations?query=zzzzzz
```

```text
{
  "suggestions": []
}
```

> The interface will keep the field editable and show “No location found.” The list will be queried again when the query changes.

**Example — validation error**

```http
GET /locations?query=a
```

```text
{
  "error": {
    "code": "INVALID_LOCATION_QUERY",
    "message": "Please provide at least two characters to search for a location."
  }
}
```

**Example — external unavailability**

```text
{
  "error": {
    "code": "LOCATION_SERVICE_UNAVAILABLE",
    "message": "Unable to fetch locations right now. Please try again."
  }
}
```

---

#### `POST /weather`

Queries current conditions for the chosen suggestion. Although it uses `POST` to carry a structured object, the operation does not produce persistent effects and does not require an idempotency key.

**Body**

| Field | Type | Default | Rules |
| --- | --- | --- | --- |
| `location` | `LocationSuggestion` | — | Required; non-empty text fields, `administrativeArea` textual or `null`, and coordinates within WGS84 limits. |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `WeatherResponse` | Location and weather response are valid. |
| `400` | `ApiError` | The body or location is invalid. |
| `503` | `ApiError` | The forecast fails, exceeds timeout, or returns an invalid payload. |
| `500` | `ApiError` | An unexpected internal failure occurs. |

**Example — success**

```http
POST /weather
Content-Type: application/json
```

The request body is the `WeatherRequest` example, and the response body is the `WeatherResponse` example. The response will include `Cache-Control: no-store`.

**Example — invalid selection**

```text
{
  "location": {
    "city": "Springfield",
    "administrativeArea": "Illinois",
    "country": "United States",
    "coordinates": {
      "latitude": 200,
      "longitude": -89.6436
    }
  }
}
```

```text
{
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Select a valid location."
  }
}
```

> The backend will return the validated selection labels in the result and use exactly that selection’s coordinates in the forecast.

---

#### `GET /health`

Keeps the process’s local check without querying external dependencies.

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ status: "healthy", timestamp: string }` | The FastAPI process responds. |

**Example — success**

```http
GET /health
```

```text
{
  "status": "healthy",
  "timestamp": "2026-08-05T15:00:00.000Z"
}
```

---

## Integration points

- **Open-Meteo Geocoding API:** the endpoint configured in `OPEN_METEO_GEOCODING_URL` will receive `count=5`, `language=pt`, and `format=json`. Two letters only produce exact matches; from three onward, the source uses normalized prefix matching. Reference: [official geocoding documentation](https://open-meteo.com/en/docs/geocoding-api).
- **Weather Forecast API:** the existing integration will keep querying only current conditions and metric units for the selected coordinates. Reference: [official forecast documentation](https://open-meteo.com/en/docs).
- **Authentication:** no new API key will be added within the current non-commercial scope. URLs remain configurable through existing variables.
- **Timeout:** each use case will create an `AbortController` with the existing budget of 2,500 ms. Timeout is a failure limit; it does not replace the 500 ms target for suggestions.
- **Cancellation:** the frontend will abort the previous request when the query changes or the component unmounts, and it will also compare request identity before changing state. The backend will terminate its external call at the configured timeout.
- **Failures:** network issues, `429`, other non-success statuses, invalid JSON, or missing required fields will be normalized into the operation-specific `503` error.
- **Retry and cache:** there will be no retry and no cache. `Cache-Control: no-store` will be sent in location and weather responses.
- **Attribution:** existing Open-Meteo/CC BY 4.0 attribution will remain with the weather result; geocoding data is based on GeoNames per the official documentation.



## Testing approach

Frontend and backend will continue using Vitest, with minimum 80% coverage for lines, functions, branches, and statements. Tests will follow FIRST and AAA or Given/When/Then; external network will be replaced by deterministic stubs. Playwright will remain in `e2e/` and cover only critical end-to-end flows.

### Unit tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TU-BE-01 | Normalizes query and applies the minimum threshold | CA-01, CA-02 | Spaces are normalized; zero or one useful character fails before the provider, and two proceed to search. |
| TU-BE-02 | Maps up to five suggestions and nullable region | CA-01, CA-03 | The list preserves order, limits to five items, and outputs city, region or `null`, country, and coordinates. |
| TU-BE-03 | Differentiates empty list from invalid payload | CA-08, CA-09 | `results: []` becomes empty success; invalid envelope or item becomes unavailability. |
| TU-BE-04 | Searches locations with fixed parameters and timeout | CA-01, CA-09, CA-11 | The client sends `count=5`, correct language and format, does not repeat the call, and aborts within budget. |
| TU-BE-05 | Validates the selected location | CA-04 | Valid text fields, nullability, and WGS84 limits are accepted; other bodies fail as `INVALID_LOCATION`. |
| TU-BE-06 | Queries forecast with exact coordinates | CA-04 | The service calls only forecast, preserves selected labels, and does not geocode again. |
| TU-FE-01 | Interprets location success, empty, and error | CA-01, CA-08, CA-09 | The service accepts the valid contract and normalizes malformed or non-success responses. |
| TU-FE-02 | Applies debounce and avoids call below minimum | CA-01, CA-02, CA-07, CA-11 | With controlled clock, the call starts once after 200 ms and exposes loading without clearing query. |
| TU-FE-03 | Ignores stale responses | CA-10 | The previous request is aborted and does not change state after a newer query. |
| TU-FE-04 | Exposes combobox semantics | CA-03, CA-12 | Field, list, options, expanded state, active item, and feedback have correct ARIA roles, names, and relationships. |
| TU-FE-05 | Navigates and selects via keyboard | CA-06 | Arrow keys change active option, Enter selects, and Escape closes without clearing text. |
| TU-FE-06 | Selects by pointer and closes list | CA-05 | Click or pointer event chooses the option, keeps interaction valid, and closes the popup. |
| TU-FE-07 | Sends structured selection to weather | CA-04, CA-05 | The hook starts `POST /weather` once with labels and coordinates from the chosen option. |

Backend parsers will accept `unknown` and cover numeric limits, omitted fields, empty arrays, and invalid items. The frontend will use Testing Library, `user-event`, fake timers, and queries by role/accessible name, without assertions on Tailwind classes.

### Integration tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TI-BE-01 | Returns up to five locations with `no-store` | CA-01, CA-03 | TestClient receives the ordered 200 contract, and each suggestion has display fields. |
| TI-BE-02 | Rejects insufficient query without calling provider | CA-02 | `GET /locations` returns stable 400 and the stub is not executed. |
| TI-BE-03 | Returns empty success | CA-08 | No matches returns 200 with `suggestions: []`. |
| TI-BE-04 | Normalizes location source failure | CA-09 | Network, timeout, non-success status, and invalid JSON return `LOCATION_SERVICE_UNAVAILABLE`. |
| TI-BE-05 | Queries weather for chosen homonym | CA-04 | `POST /weather` uses exactly the body coordinates and identifies the same labels in response. |
| TI-BE-06 | Rejects invalid selection before forecast | CA-04 | Invalid coordinate or label returns 400 and does not call source. |
| TI-FE-01 | Integrates autocomplete, selection, and weather | CA-04, CA-05, CA-07, CA-10 | The view shows loading, discards stale results, closes the list, and starts querying the selected option. |

Backend tests will create the application with a stub `WeatherProvider` and FastAPI TestClient, without binding a port and without real network. Frontend tests will replace only `fetch` at the service boundary.
### E2E Tests (if applicable)

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| E2E-01 | Selects a homonymous city with the pointer | CA-01, CA-03, CA-04, CA-05 | Up to five suggestions appear, the selected option closes the list, and the result identifies the exact locality. |
| E2E-02 | Operates the combobox using keyboard only | CA-06, CA-12 | Arrow keys, Enter, and Escape work; focus, active item, list, and messages are exposed semantically. |
| E2E-03 | Handles minimum input, empty state, and unavailability | CA-02, CA-08, CA-09 | Fewer than two characters does not call the API; empty and error states are announced, and editing allows trying again. |
| E2E-04 | Keeps only the current query response | CA-10 | Controlled out-of-order responses never display stale suggestions. |
| E2E-05 | Measures suggestions p95 | CA-11 | In 20 samples, at least 95% appear within 500 ms from the last keystroke. |
| E2E-06 | Keeps autocomplete responsive | CA-13 | At 360 px and 1280 px, the list and options remain readable and do not cause horizontal overflow. |

The Open-Meteo mock will provide homonymous localities with different coordinates, an empty list, error, and responses with reversed delays. E2E-05 will use the deterministic mock in CI and include an optional real run in QA. Real measurement will record date, network, samples, and p95; external unavailability will not make the deterministic test flaky, but a real p95 above 500 ms will require analysis before approving CA-11.



## Development sequencing

### Build order

1. Define shared types, new errors, and contract tests, locking boundaries before changing the existing flow.
2. Refactor the parser and `WeatherProvider`, implement `SearchLocations`, and expose `GET /locations` with unit and integration tests.
3. Validate structured selection, change `GetCurrentWeather`, and replace `GET /weather?city` with `POST /weather`.
4. Create frontend HTTP services and hooks, including debounce, cancellation, and protection against stale responses.
5. Create the small combobox components, connect them to `WeatherView`, and remove the old form/button.
6. Adapt the Open-Meteo mock and E2E tests for homonyms, keyboard interaction, failures, responsiveness, and performance.
7. Run coverage, tests, lint, typecheck, and builds for each application; run the Playwright suite last.

### Technical dependencies

- No production or development dependency will be added.
- Existing React 19, `fetch`, `AbortController`, Tailwind CSS, Vitest, Testing Library, and Playwright are sufficient.
- Open-Meteo Geocoding API and Weather Forecast API must be available for real usage; automated tests will use the local mock.
- Existing `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL`, and `OPEN_METEO_TIMEOUT_MS` will be reused with no new environment variable.
- The `GET /weather?city` endpoint will be removed; no external client requiring compatibility has been identified.



## Monitoring and observability

- `GET /health` will remain as a liveness check and will not query Open-Meteo.
- The backend will emit `location_suggestions_completed` at `info` level, with `status`, `result`, `resultCount`, and `durationMs`.
- Suggestion failures will emit `location_suggestions_failed` at `error` level, with `status`, `cause`, `dependency`, and `durationMs`.
- The weather query will preserve current success and failure events, adapted to the new flow without intermediate geocoding.
- Query text, locality names, coordinates, and external payloads will not be logged, reducing unnecessary exposure of usage data.
- The MVP will not add browser telemetry. The 500 ms p95 will be protected by the controlled test and measured in the real QA run; production observability will require a future frontend metrics initiative.



## Technical considerations

### Main decisions

- **Separate endpoint for suggestions:** `GET /locations` keeps search idempotent and separates geocoding from forecasting.
- **Structured selection in `POST /weather`:** avoids a second geocoding call, ensures the interface sends selected coordinates, and simplifies the homonym flow.
- **Replacing the old contract:** keeping `GET /weather?city` would preserve silent selection of the first result and duplicate flows; it will be removed because there is no known external consumer.
- **200 ms debounce:** reduces calls while typing and reserves up to 300 ms of the 500 ms goal for frontend, backend, and upstream under normal conditions.
- **Custom combobox without a library:** the interface is small and existing resources are sufficient; the [official WAI-ARIA APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and its keyboard/focus requirements will be followed.
- **Effect only for external synchronization:** timer, request, and cancellation will live in `useLocationSuggestions`; derived state and selection interaction will remain outside Effect, per the [React documentation](https://react.dev/reference/react/useEffect).
- **Selection as a search pause:** choosing an option will fill the field, mark the selection, and call the hook with `enabled=false`; the next edit will clear the selection and reactivate suggestions. This prevents reopening the list with prefilled text.
- **No cache and no retry:** reduces complexity, avoids stale suggestions, and keeps consumption and latency predictable in the MVP.
- **No persistent identifier:** coordinates and labels already returned by the backend are enough for the current scope; resolving an ID again would increase latency and external calls.

### Known risks

- **500 ms target depends on network and provider:** debounce leaves 300 ms for the external chain. Mitigation: small payload, one external call, cancellation, controlled test, and real QA measurement.
- **Two-letter searches are limited upstream:** Open-Meteo only does exact matching with two characters and prefix matching from three onward. Mitigation: handle empty list normally and allow continued typing.
- **Call volume while typing:** browser cancellation does not guarantee that a request already received by the backend stops consuming upstream. Mitigation: debounce, limit of five, no retry, and monitoring of duration/failures.
- **Labels and coordinates come from the client in the second step:** a client outside the interface can send inconsistent combinations, although there is no write, authentication, or sensitive decision. Mitigation: strict validation; if the contract gains security impact, switch to a provider identifier resolved in the backend.
- **Accessible combobox requires careful synchronization:** blur, pointer, keyboard, and `aria-activedescendant` can diverge. Mitigation: keep focus on the input, separate hooks, and component/E2E tests by accessible role.
- **Breaking change in weather endpoint:** unidentified consumers of `GET /weather?city` would stop working. Mitigation: confirm consumers again before implementation and document `POST /weather`.

### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were fully read: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `python.md`, and `tests.md`.

- Frontend and backend will remain independent applications, with commands run in their respective directories.
- The flow will follow `view → components/hooks → services → backend` and `request → routes → services → data`.
- Each type will live in its own file; TypeScript files will be up to 100 lines, components/functions up to 30 lines, and at most three parameters, using objects when needed.
- Code will use strict TypeScript, `unknown` at boundaries, no `any`, no mutation, strict comparisons, and constants for debounce, limits, and messages.
- Backend I/O will remain asynchronous, without event loop blocking, with configurable URLs and timeout, centralized logging, and no circular references.
- All new or changed code will have automated tests. Vitest will keep a minimum of 80% for lines, functions, branches, and statements; Playwright will stay in `e2e/`.
- During implementation, `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` will be run in frontend; `npm run build`, `npm test`, and `npm run test:coverage` in backend; and `npm test` in `e2e/`.

There is no planned deviation from the rules. The outdated note in `AGENTS.md` about the absence of a frontend testing framework does not change this decision, since the repository already contains Vitest, scripts, and configured coverage thresholds.

### Compliance with skills

- `react` — applied to separation between components, hooks, and services; using Effect only for timer/request with cleanup; single source of truth; explicit props; accessible semantics; and responsive styling with Tailwind CSS.

There is no planned deviation from the applicable skill.
### Relevant and dependent files

Documentation:

- `tasks/prd-location-autocomplete/prd.md`
- `tasks/prd-location-autocomplete/techspec.md`
- `tasks/prd-weather-panel/techspec.md`
- `AGENTS.md`
- `.agents/rules/*.md`
- `.agents/skills/react/SKILL.md` and applicable references

Backend:

- `backend/src/app.py`
- `backend/src/routes/locations-route.py` (new)
- `backend/src/routes/weather-route.py`
- `backend/src/services/normalize-location-query.py` (new; replaces `normalize-city.ts`)
- `backend/src/services/validate-selected-location.py` (new)
- `backend/src/services/search-locations.py` (new)
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
- `backend/src/types/location-suggestion.py` (new)
- `backend/src/types/location-suggestions-response.py` (new)
- Tests near the modules and `backend/src/weather-route.test.ts`

Frontend:

- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/LocationAutocomplete.tsx` (new)
- `frontend/src/components/LocationSuggestionsList.tsx` (new)
- `frontend/src/components/LocationSuggestionFeedback.tsx` (new)
- `frontend/src/components/WeatherSearchForm.tsx` (removed)
- `frontend/src/hooks/useLocationSuggestions.ts` (new)
- `frontend/src/hooks/useComboboxNavigation.ts` (new)
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/location-service.py` (new)
- `frontend/src/services/weather-service.py`
- `frontend/src/types/location-suggestion.py` (new)
- `frontend/src/types/location-search-state.py` (new)
- `frontend/src/types/api-error.py`
- `*.test.ts` and `*.test.tsx` tests near the affected modules

E2E and configuration:

- `backend/.env.example`
- `frontend/.env.example`
- `backend/vitest.config.ts`
- `frontend/vitest.config.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/real-performance.spec.ts`
- `e2e/playwright.config.ts`
