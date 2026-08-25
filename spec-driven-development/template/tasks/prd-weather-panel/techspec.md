# Technical specification — Weather panel

## Summary

Add `GET /weather?city=` to the FastAPI backend. The route validates input, resolves the first Open-Meteo geocoding hit, fetches current conditions, maps WMO codes to English, and returns a stable JSON contract. The React frontend replaces the health poller with an accessible weather panel that talks only to the backend. No database, cache, or browser calls to Open-Meteo.

## Architecture

```text
WeatherView → useWeatherSearch → weatherService → GET /weather
  → routes/weather → services/weather → data/open_meteo → Open-Meteo APIs
```

### Backend layout (lean)

| Module | Responsibility |
| --- | --- |
| `models/weather.py` | Pydantic contracts and `WeatherProvider` protocol |
| `errors.py` | `AppError` codes and factories |
| `data/open_meteo.py` | httpx client, payload parsing, WMO lookup |
| `services/weather.py` | City normalization, orchestration, response assembly |
| `routes/weather.py` | HTTP binding, `Cache-Control: no-store` |
| `app.py` | CORS, `/health`, `/weather`, error envelope |

### Frontend layout

| Module | Responsibility |
| --- | --- |
| `services/weather-service.ts` | Only module that knows `VITE_API_BASE_URL` |
| `hooks/useWeatherSearch.ts` | idle/loading/success/error state machine |
| `views/WeatherView.tsx` | Screen composition |
| `components/Weather*.tsx` | Form, feedback, result, attribution |

## Public contract

### Success `200`

```json
{
  "location": { "city": "São Paulo", "administrativeArea": "São Paulo", "country": "Brazil" },
  "current": {
    "temperature": 24.3,
    "apparentTemperature": 25.1,
    "condition": "Partly cloudy",
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
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
  }
}
```

### Errors

| HTTP | code | When |
| --- | --- | --- |
| 400 | `INVALID_CITY` | Missing, whitespace-only, or fewer than two meaningful characters; duplicate `city` query params |
| 404 | `CITY_NOT_FOUND` | Geocoding returns no results |
| 503 | `WEATHER_SERVICE_UNAVAILABLE` | Upstream failure, timeout, or invalid provider payload |

Envelope: `{ "error": { "code": "...", "message": "..." } }`

## API

### `GET /health`

Unchanged liveness check; no external dependencies.

### `GET /weather?city=`

- Query: single `city` string.
- Response header: `Cache-Control: no-store`.
- Shared upstream timeout budget: 2500 ms (geocoding + forecast).
- Env overrides: `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL`, `OPEN_METEO_TIMEOUT_MS`.

## Test cases

| ID | Layer | Scenario | Maps to |
| --- | --- | --- | --- |
| TU-BE-01 | Unit | Normalize city trims spaces and rejects short input | CA-05 |
| TU-BE-02 | Unit | WMO code maps to English; unknown code fails closed | CA-03 |
| TU-BE-03 | Unit | Parse geocoding picks first result and admin area | CA-02 |
| TU-BE-04 | Unit | Parse forecast validates units and ranges | CA-03 |
| TI-BE-01 | Integration | `GET /weather` success contract | CA-01, CA-03 |
| TI-BE-02 | Integration | Invalid city returns 400 without provider call | CA-05 |
| TI-BE-03 | Integration | Empty geocoding returns 404 | CA-06 |
| TI-BE-04 | Integration | Provider failure returns 503 | CA-07 |
| TU-FE-01 | Unit | Hook validates city client-side | CA-05 |
| TU-FE-02 | Unit | Hook blocks duplicate in-flight search | CA-08 |
| TU-FE-03 | Unit | Service parses success payload | CA-03 |
| TU-FE-04 | Unit | Service maps API errors | CA-06, CA-07 |
| TI-FE-01 | Integration | View shows loading, success, validation, not-found | CA-01, CA-05, CA-06 |
| E2E-01 | E2E | Valid search shows full result | CA-01, CA-03, CA-13 |
| E2E-02 | E2E | Browser never calls Open-Meteo | CA-04 |
| E2E-03 | E2E | Invalid input, zero `/weather` requests | CA-05 |
| E2E-04 | E2E | Not found then successful retry | CA-06 |
| E2E-05 | E2E | Unavailable clears prior result and retries | CA-07 |

## Non-goals

- Geolocation, homonym picker, unit/language switching, persistence, retry loops, or observability beyond basic route handling.
