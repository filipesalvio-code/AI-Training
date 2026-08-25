# Technical specification



## Summary

Language switching will be handled in the frontend, with no network calls. The backend will no longer be the source of displayed text and will instead expose the data needed for client-side translation: `current.weatherCode` (WMO code) and `location.countryCode` (ISO-3166-1 alpha-2), while keeping `current.condition` in pt-BR as a legacy field so the current contract is not broken. The frontend will gain its own minimal i18n layer — typed dictionaries by language, a React context with the active language, a `useTranslation` hook, and `Intl`-based formatters — so switching language is only a state change that re-renders the already mounted tree.

With this, switching language does not trigger a request, does not cancel in-flight queries, preserves typed input and the displayed result, and completes within the CA-11 limit of 300 ms. The backend will start accepting an optional `lang` in `GET /weather`, used only to request already localized names from the Geocoding API in the initial query; missing or invalid values keep `pt`. Error messages will no longer travel as displayable text: the frontend state will store only `ApiErrorCode`, and presentation will choose the message in the active language, which satisfies CA-05 and CA-06 without a new query. No preference will be persisted — language resets to pt-BR on every load, according to RF18 and RF19.



## System architecture

### Component overview

The translation flow (no network) and query flow (with network) coexist without crossing:

```text
LanguageProvider (state: language)
  → useTranslation → t(key), language, toggleLanguage
    → LanguageToggle          (switches language)
    → WeatherView             (aria-label, header, footer)
      → WeatherSearchForm     (label, placeholder, button, validation)
      → WeatherFeedback       (loading and error by code)
      → WeatherResult         (labels, condition by weatherCode, country by countryCode, numbers via Intl)
      → SourceAttribution     (attribution and license)
  → useDocumentLanguage       (document.documentElement.lang and document.title)

WeatherView → useWeatherSearch.search(city, language)
  → weatherService → GET /weather?city=...&lang=...
    → weatherRoute → GetCurrentWeather → OpenMeteoClient (geocoding language=pt|en)
```

New frontend components:

- `src/i18n/language-context.py` — creates the language context without exporting a component, avoiding the `react-refresh/only-export-components` warning.
- `src/components/LanguageProvider.tsx` — keeps the active language in state, builds the context value, and syncs the document.
- `src/components/LanguageToggle.tsx` — single toggle button, with translated accessible name and visible text.
- `src/hooks/useTranslation.py` — exposes `language`, `t`, and `toggleLanguage`; fails explicitly outside the provider.
- `src/hooks/useDocumentLanguage.py` — the feature’s only effect; syncs document `lang` and `title`.
- `src/i18n/pt-br.ts` and `src/i18n/en.py` — complete dictionaries, typed as `Record<TranslationKey, string>`.
- `src/i18n/translations.py` — aggregates dictionaries by language and exposes the key lookup function.
- `src/i18n/weather-conditions-pt-br.ts` and `src/i18n/weather-conditions-en.py` — WMO code labels.
- `src/i18n/weather-condition-label.py` — resolves code + language, with fallback to text received from the backend.
- `src/i18n/format-measurement.py` — formats numbers by language with `Intl.NumberFormat` and concatenates the unit.
- `src/i18n/country-name.py` — translates country with `Intl.DisplayNames`, with fallback to the received name.
- `src/types/language.py`, `src/types/translation-key.py`, `src/types/translations.py`, `src/types/language-context-value.py` — one type per file.

Modified frontend components:

- `src/App.tsx` — will wrap the view with `LanguageProvider`.
- `src/views/WeatherView.tsx` — will consume `t`, display `LanguageToggle` in the header, and pass language to search.
- `src/components/WeatherSearchForm.tsx` — will receive texts through view-translated props, keeping props explicit.
- `src/components/WeatherFeedback.tsx` — will start receiving `ApiErrorCode` and translating it, instead of displaying backend message text.
- `src/components/WeatherResult.tsx` — will use `weatherCode`, `countryCode`, and the formatters.
- `src/components/SourceAttribution.tsx` — will compose the two translated text segments around the links.
- `src/hooks/useWeatherSearch.py` — `search(city, language)`; error state will store only the code.
- `src/services/weather-service.py` — will send `lang`, validate `weatherCode` and `countryCode`, and stop containing messages.
- `src/types/api-error.py`, `src/types/weather-search-state.py`, `src/types/weather-response.py` — will reflect the new contract.

Modified backend components:

- `src/services/normalize-language.py` — **new**; converts raw `lang` value into the supported geocoding language.
- `src/routes/weather-route.py` — will read `lang`, normalize it, and pass it to the use case.
- `src/services/get-current-weather.py` — `execute(city, language)`; will include `weatherCode` and `countryCode` in the response.
- `src/data/open-meteo-client.py` — `searchFirstLocation(city, language, signal)`; `language` is no longer fixed.
- `src/data/parse-geocoding-response.py` — will extract and validate `country_code`.
- `src/types/weather-provider.py`, `src/types/resolved-location.py`, `src/types/weather-location.py`, `src/types/current-conditions.py` — will reflect the new fields.

Relations and boundaries:

- No i18n module knows HTTP; no backend-access module knows dictionaries.
- `useWeatherSearch` does not import language context: it receives language as a parameter, remaining testable in isolation.
- The backend does not gain an English dictionary; the project’s only English text table remains in the frontend.
- `e2e/mock-open-meteo.mjs` will start returning `country_code` and reflecting the received `language` parameter.



## Implementation design

### Main interfaces

```text
useTranslation() -> { language, t, toggleLanguage }
  t(key: TranslationKey) -> string
  toggleLanguage() -> void

weatherConditionLabel(code, language, fallback) -> string
formatMeasurement(value, unit, language) -> string
countryName(countryCode, fallback, language) -> string
```

```text
WeatherProvider (backend)
  searchFirstLocation(city, language, signal) -> Promise<ResolvedLocation | null>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>

GetCurrentWeather
  execute(city, language) -> Promise<WeatherResponse>

normalizeLanguage(value: unknown) -> 'pt' | 'en'

WeatherService (frontend)
  search(city, language, signal) -> Promise<WeatherResponse>
```

`toggleLanguage` will use functional state updates. The context value will not be memoized: `LanguageProvider` stores only the language and re-renders only when it changes, in which case all consumers need to re-render anyway.
### Data models

The contracts below cover what changes in this feature. Unchanged contracts (`Coordinates`, `ProviderConditions`, `WeatherUnits`, `SourceAttribution`) remain as specified in the weather panel TechSpec. Missing fields from the source are still normalized to `null`.

#### `Language` — active interface language

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| — | `'pt-BR' \| 'en'` | yes | Closed union; `pt-BR` is the default on every load. |

```text
"pt-BR"
```

#### `TranslationKey` and `Translations` — keys and dictionaries

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `TranslationKey` | literal union | yes | Closed key list declared in `types/translation-key.ts`. |
| `Translations` | `Record<TranslationKey, string>` | yes | Each dictionary implements the full record; a missing key breaks compilation. |

| Key | pt-BR | en |
| --- | --- | --- |
| `header.eyebrow` | PAINEL METEOROLÓGICO | WEATHER PANEL |
| `header.title` | Clima de agora | Weather right now |
| `header.subtitle` | Consulte as condições atuais de qualquer cidade e veja a localidade resolvida em um instante. | Check current conditions for any city and see the resolved location in an instant. |
| `search.sectionLabel` | Consulta meteorológica | Weather search |
| `search.cityLabel` | Nome da cidade | City name |
| `search.cityPlaceholder` | Ex.: São Paulo | E.g. São Paulo |
| `search.submit` | Consultar clima | Check weather |
| `search.submitting` | Consultando… | Checking… |
| `feedback.loading` | Consultando as condições atuais… | Fetching current conditions… |
| `feedback.retryHint` | Confira o nome da cidade e tente novamente. | Check the city name and try again. |
| `error.INVALID_CITY` | Informe uma cidade com pelo menos dois caracteres. | Enter a city with at least two characters. |
| `error.CITY_NOT_FOUND` | Cidade não encontrada. Verifique o nome e tente novamente. | City not found. Check the name and try again. |
| `error.WEATHER_SERVICE_UNAVAILABLE` | Não foi possível consultar o clima agora. Tente novamente em instantes. | We could not check the weather right now. Try again shortly. |
| `error.INTERNAL_ERROR` | Ocorreu um erro inesperado. Tente novamente. | An unexpected error occurred. Try again. |
| `result.resolvedLocation` | Localidade resolvida | Resolved location |
| `result.apparentTemperature` | Sensação térmica | Feels like |
| `result.relativeHumidity` | Umidade relativa | Relative humidity |
| `result.windSpeed` | Velocidade do vento | Wind speed |
| `result.condition` | Condição atual | Current condition |
| `source.dataBy` | Dados por | Data by |
| `source.licensedUnder` | , licenciados sob | , licensed under |
| `footer.note` | Atualizado sob demanda · sem histórico de buscas | Updated on demand · no search history |
| `document.title` | Clima de agora | Weather right now |
| `language.toggleText` | PT → EN | EN → PT |
| `language.toggleLabel` | Idioma atual: português. Trocar para inglês. | Current language: English. Switch to Portuguese. |

> **Sentence composition with links:** `SourceAttribution` concatenates `source.dataBy` + source link + `source.licensedUnder` + license link + `.`, in the same order in both languages. A future language that requires a different order must replace both segments with a full sentence key with placeholders, not reorder the JSX.

#### `LanguageContextValue` — value exposed by context

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `language` | `Language` | yes | Active language. |
| `t` | `(key: TranslationKey) => string` | yes | Looks up the key in the active language dictionary. |
| `toggleLanguage` | `() => void` | yes | Switches between the two languages in one call. |

```text
{
  "language": "pt-BR",
  "t": "(key) => string",
  "toggleLanguage": "() => void"
}
```

#### `ResolvedLocation` — internal backend location (modified)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | `string` | yes | City name, localized by the geocoding language. |
| `administrativeArea` | `string \| null` | yes | First available division in `admin1` → `admin4`. |
| `country` | `string` | yes | Country localized by the geocoding language. |
| `countryCode` | `string \| null` | yes | **New.** Uppercase ISO-3166-1 alpha-2; `null` when missing or out of format. |
| `coordinates` | `Coordinates` | yes | Coordinates used in the forecast. |

```text
{
  "city": "München",
  "administrativeArea": "Bayern",
  "country": "Germany",
  "countryCode": "DE",
  "coordinates": { "latitude": 48.1374, "longitude": 11.5755 }
}
```

#### `WeatherLocation` — public location (modified)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `city` | `string` | yes | Selected city, as returned by the provider. |
| `administrativeArea` | `string \| null` | yes | Available administrative division or `null`. |
| `country` | `string` | yes | Country in the language requested in the query; used as fallback. |
| `countryCode` | `string \| null` | yes | **New.** Basis for country translation on the client. |

```text
{
  "city": "München",
  "administrativeArea": "Bayern",
  "country": "Germany",
  "countryCode": "DE"
}
```

#### `CurrentConditions` — current conditions (modified)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `temperature` | `number` | yes | Temperature in °C. |
| `apparentTemperature` | `number` | yes | Feels-like temperature in °C. |
| `weatherCode` | `number` | yes | **New.** Known integer WMO code; basis for translation on the client. |
| `condition` | `string` | yes | **Legacy.** Description always in pt-BR, kept for compatibility; used only as fallback. |
| `relativeHumidity` | `number` | yes | Relative humidity between 0 and 100. |
| `windSpeed` | `number` | yes | Wind speed in km/h. |

```text
{
  "temperature": 24.3,
  "apparentTemperature": 25.1,
  "weatherCode": 2,
  "condition": "Parcialmente nublado",
  "relativeHumidity": 72,
  "windSpeed": 12.4
}
```

> **Legacy field:** `condition` does not track `lang`. New consumers must use `weatherCode`. The frontend only falls back to `condition` if the code does not exist in the local dictionary, which is currently unreachable because the backend rejects unknown codes with `WEATHER_SERVICE_UNAVAILABLE`.

#### `ApiError` — frontend error (modified)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `code` | `ApiErrorCode` | yes | Only data stored in state; the message is now derived from `error.<code>`. |

```text
{
  "code": "CITY_NOT_FOUND"
}
```

> **Unchanged HTTP envelope:** the backend still responds with `{ "error": { "code", "message" } }` and stable pt-BR `message`. The frontend reads only `code` and discards `message`.

#### `WeatherResponse` — aggregated contract (modified)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | yes | Includes `countryCode`. |
| `current` | `CurrentConditions` | yes | Includes `weatherCode`. |
| `units` | `WeatherUnits` | yes | Unchanged; metric in both languages. |
| `source` | `SourceAttribution` | yes | Unchanged. |

```text
{
  "location": {
    "city": "München",
    "administrativeArea": "Bayern",
    "country": "Germany",
    "countryCode": "DE"
  },
  "current": {
    "temperature": 24.3,
    "apparentTemperature": 25.1,
    "weatherCode": 2,
    "condition": "Parcialmente nublado",
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

#### `lang` mapping → geocoding language

| Value received in `lang` | Language sent to Open-Meteo | Note |
| --- | --- | --- |
| missing | `pt` | Preserves current contract behavior. |
| `pt-BR`, `pt-br`, `pt` | `pt` | Case-insensitive comparison. |
| `en`, `en-US`, `en-GB` | `en` | `en` prefix is sufficient. |
| any other value, array, or unexpected type | `pt` | Falls back to default; does **not** produce `400`. |

#### Geocoding API → contract mapping (addition)

| Source (Open-Meteo) | Destination (contract) |
| --- | --- |
| `results[0].country_code` | `location.countryCode`, normalized to uppercase when matching two letters; otherwise `null` |
| `language=<pt\|en>` | language of `results[0].name`, `country`, and `admin*` |

#### WMO code mapping → label by language

| Code | pt-BR | en |
| --- | --- | --- |
| `0` | Céu limpo | Clear sky |
| `1` | Predominantemente limpo | Mainly clear |
| `2` | Parcialmente nublado | Partly cloudy |
| `3` | Encoberto | Overcast |
| `45` | Neblina | Fog |
| `48` | Neblina com geada | Depositing rime fog |
| `51` | Garoa leve | Light drizzle |
| `53` | Garoa moderada | Moderate drizzle |
| `55` | Garoa forte | Dense drizzle |
| `56` | Garoa congelante leve | Light freezing drizzle |
| `57` | Garoa congelante forte | Dense freezing drizzle |
| `61` | Chuva fraca | Slight rain |
| `63` | Chuva moderada | Moderate rain |
| `65` | Chuva forte | Heavy rain |
| `66` | Chuva congelante leve | Light freezing rain |
| `67` | Chuva congelante forte | Heavy freezing rain |
| `71` | Neve fraca | Slight snow fall |
| `73` | Neve moderada | Moderate snow fall |
| `75` | Neve forte | Heavy snow fall |
| `77` | Grãos de neve | Snow grains |
| `80` | Pancadas de chuva fracas | Slight rain showers |
| `81` | Pancadas de chuva moderadas | Moderate rain showers |
| `82` | Pancadas de chuva fortes | Violent rain showers |
| `85` | Pancadas de neve fracas | Slight snow showers |
| `86` | Pancadas de neve fortes | Heavy snow showers |
| `95` | Trovoada | Thunderstorm |
| `96` | Trovoada com granizo leve | Thunderstorm with slight hail |
| `99` | Trovoada com granizo forte | Thunderstorm with heavy hail |

The pt-BR column is identical to the table already implemented in `backend/src/services/weather-condition.py`, which remains unchanged to feed the legacy `condition` field.

#### Number and country formatting on the client

| Rule | pt-BR | en |
| --- | --- | --- |
| `Intl.NumberFormat`, `maximumFractionDigits: 1` | `24,3` | `24.3` |
| Concatenation with unit | `24,3°C`, `72%`, `12,4km/h` | `24.3°C`, `72%`, `12.4km/h` |
| `Intl.DisplayNames(type: 'region')` over `countryCode` | `DE` → Alemanha | `DE` → Germany |
| `countryCode` null, invalid, or no result from `Intl` | uses received `location.country` | uses received `location.country` |

> **Spacing preserved:** value+unit concatenation remains without spaces, as already displayed today. This feature changes only the decimal separator; changing spacing would be a visual change not requested by the PRD.

There is no database schema or any persistence: language lives only in component state and is discarded on reload.
### API Endpoints (if applicable)

#### Overview

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/weather` | Resolves the city and returns current conditions; accepts optional `lang`. |
| `GET` | `/health` | Unchanged by this feature. |

---

#### `GET /weather`

**Query parameters**

| Parameter | Type | Default | Rules |
| --- | --- | --- | --- |
| `city` | `string` | — | Unchanged: required and single, `trim`, whitespace collapse, minimum of two Unicode alphanumeric characters. |
| `lang` | `string` | `pt-BR` | **New.** Optional. Normalized according to the mapping table; invalid, repeated, or unexpected-type value falls back to `pt` without error. |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `WeatherResponse` | Location and conditions validated; includes `weatherCode` and `countryCode`. |
| `400` | `ApiError` | Only for invalid `city`; `lang` never produces `400`. |
| `404` | `ApiError` | No matching location. |
| `503` | `ApiError` | Failure, timeout, or invalid payload from external dependency. |
| `500` | `ApiError` | Unexpected internal failure. |

**Example — success in English**

```http
GET /weather?city=Munich&lang=en
```

The body is the `WeatherResponse` example documented in “Data models,” with `location.country` equal to `Germany` because it was geocoded with `language=en`. `Cache-Control: no-store` is preserved.

**Example — success without `lang`**

```http
GET /weather?city=Munique
```

```text
{
  "location": {
    "city": "Munique",
    "administrativeArea": "Baviera",
    "country": "Alemanha",
    "countryCode": "DE"
  }
}
```

> Partial excerpt; the remaining fields follow the full contract.

**Example — unknown `lang`**

```http
GET /weather?city=Munique&lang=xx
```

Returns `200` with geocoding in `pt`, exactly like the request without `lang`.

**Example — country without source code**

```text
{
  "location": {
    "city": "Example City",
    "administrativeArea": null,
    "country": "Example Country",
    "countryCode": null
  }
}
```

> With `countryCode` null, the frontend displays `country` as received in both languages, according to RF10.

---

## Integration points

- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search`. The `language` parameter is no longer fixed to `pt` and now receives `pt` or `en`. The [official documentation](https://open-meteo.com/en/docs/geocoding-api) describes `language` as “translated results, if available” and defines `country_code` as ISO-3166-1 alpha-2, with localized `country` when possible. Missing translation in the provider is not an error: the name comes as available.
- **Weather Forecast API:** unchanged. No new parameters; `weather_code` is already requested and validated.
- **Authentication, timeout, retry, and cache:** unchanged. The single 2,500 ms budget and absence of retry still apply; the feature adds no external calls.
- **`Intl.NumberFormat` and `Intl.DisplayNames`:** standard browser APIs, with no new dependency. `Intl.DisplayNames` will be called inside a guarded block; any exception or undefined result falls back to the name received from the backend.
- **License:** attribution to Open-Meteo and the CC BY 4.0 license remain visible in both languages; only phrase connectors are translated, and source name, license name, and URLs remain unchanged.



## Testing approach

Vitest on frontend and backend, with the 80% thresholds already configured in each app’s `vitest.config.ts`, and Playwright in `e2e/`. Existing tests asserting pt-BR text remain valid, since pt-BR remains the default; tests that depend on the `/weather` contract will be updated for the new fields. No deterministic test accesses real Open-Meteo.

### Unit tests

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TU-BE-10 | Normalizes known, missing, and invalid `lang` | CA-10 | `pt-BR`, `pt`, missing, and unknown value result in `pt`; `en` and `en-US` result in `en`; no case throws an error. |
| TU-BE-11 | Passes normalized language to geocoding | CA-10 | The search URL contains `language=en` when language is `en` and `language=pt` in the default case. |
| TU-BE-12 | Extracts and normalizes `country_code` | CA-10 | `de` becomes `DE`; missing, empty, or non-two-letter format becomes `null` without invalidating the query. |
| TU-BE-13 | Includes `weatherCode` alongside `condition` in the contract | CA-04 | The response includes the intact WMO code and the legacy pt-BR description. |
| TU-FE-10 | Ensures parity between dictionaries | CA-02, CA-08 | Both languages have exactly the same keys, with no empty values. |
| TU-FE-11 | Translates all WMO codes in both languages | CA-04 | Each of the 28 codes produces the specified label in pt-BR and in en. |
| TU-FE-12 | Falls back label for unknown code | CA-04 | Code outside the table returns received `condition`, without throwing an error. |
| TU-FE-13 | Formats number according to language | CA-09 | `24.3` is displayed as `24,3` in pt-BR and `24.3` in en, with unit preserved. |
| TU-FE-14 | Translates country from `countryCode` | CA-10 | `DE` produces `Alemanha` in pt-BR and `Germany` in en. |
| TU-FE-15 | Falls back country without code or without translation | CA-10 | With null `countryCode`, displays received `country` in both languages. |
| TU-FE-16 | Toggles language in one call | CA-01 | `toggleLanguage` switches from `pt-BR` to `en` and back, with no intermediate state. |
| TU-FE-17 | Fails when translation is used outside provider | — | `useTranslation` throws an explicit error, preventing silently missing text. |
| TU-FE-18 | Syncs `lang` and document `title` | CA-12 | After switching, `document.documentElement.lang` is `en` and the title matches the active language. |
| TU-FE-19 | Exposes accessible name and switcher text | CA-01, CA-14 | The button has translated accessible name and visible text indicating current and target language. |
| TU-FE-20 | Translates error from code | CA-05, CA-06 | The same error state renders pt-BR or en message according to active language. |
| TU-FE-21 | Sends `lang` in backend query | CA-10 | Service builds `GET /weather?city=...&lang=en` when active language is `en`. |

Backend tests validate language normalization with `unknown` values, including array and number, and parsers with missing, empty, three-letter, and lowercase `country_code`. Frontend uses Testing Library with role and accessible-name queries, without depending on CSS classes; `Intl` is not mocked, as it is deterministic in the test environment.

### Integration tests

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| TI-BE-10 | Responds 200 with `lang=en` and checks provider | CA-10, CA-17 | TestClient receives the contract with `weatherCode` and `countryCode`; the stub records `language=en`. |
| TI-BE-11 | Ignores invalid `lang` without breaking contract | CA-10 | `lang=xx` and repeated `lang` return 200 with `language=pt`, never 400. |
| TI-BE-12 | Preserves existing errors with `lang` present | CA-06, CA-17 | `INVALID_CITY`, `CITY_NOT_FOUND`, and `WEATHER_SERVICE_UNAVAILABLE` keep current code and status. |
| TI-FE-10 | Translates entire screen in initial state | CA-02, CA-08 | After switching, no product text in pt-BR remains in the rendered tree. |
| TI-FE-11 | Translates result without new request | CA-03, CA-04 | With result on screen, switching keeps data, translates labels, condition, and country, and `fetch` remains a single call. |
| TI-FE-12 | Preserves typed text when switching | CA-07 | City field value is identical before and after switch. |
| TI-FE-13 | Translates validation and error without losing state | CA-05, CA-06 | Validation and error messages remain visible and switch to new language, with retry still possible. |
| TI-FE-14 | Does not cancel in-flight query | CA-08 | With pending response, switching keeps request alive, translates loading state, and delivers result at completion. |

Backend tests build the app with a stubbed `WeatherProvider` and FastAPI TestClient, without binding a port and without network. Frontend tests replace only `fetch` at the service boundary and mount the tree inside `LanguageProvider`.
### E2E Tests

| ID | Test case name | Acceptance criteria | Expected result |
| --- | --- | --- | --- |
| E2E-10 | Finds the toggle without scrolling at 360 px | CA-01 | The button is visible above the fold and switches language in one click. |
| E2E-11 | Translates the full home screen | CA-02 | Header, form, footer, and attribution appear in English. |
| E2E-12 | Keeps and translates the displayed result | CA-03, CA-04, CA-10 | Locale, labels, condition, and country switch to English without re-running the search. |
| E2E-13 | Makes no request when switching and responds within 300 ms | CA-11 | No request to `/weather` is recorded and translated text appears within the limit. |
| E2E-14 | Preserves typed text | CA-07 | The field keeps its content after switching. |
| E2E-15 | Translates validation and error messages | CA-05, CA-06 | Messages switch language and the next attempt completes normally. |
| E2E-16 | Translates during an in-progress query | CA-08 | With a slow response, loading appears in English and the result is displayed without cancellation. |
| E2E-17 | Updates document `lang` and title | CA-12 | `html[lang]` and the title match the active language in both directions. |
| E2E-18 | Operates the toggle via keyboard | CA-13 | The button is reachable via `Tab`, has visible focus, is activated by keyboard, and remains focused after switching. |
| E2E-19 | Returns to default after reload | CA-15 | After switching to English and reloading, the page is in pt-BR. |
| E2E-20 | Keeps layout at 360 px and 1280 px in English | CA-16 | There is no horizontal scrolling or overlap with English text. |
| E2E-21 | English query sends `lang` and does not regress | CA-17 | The request includes `lang=en`, the browser does not call Open-Meteo, and the flow completes normally. |

`e2e/mock-open-meteo.mjs` will start returning `country_code` and reflecting the received `language` in the country name, allowing verification of parameter forwarding without a real network. Existing E2E tests 01 to 09 remain, with adjustments only where the contract or header changes. `real-performance.spec.ts` remains outside the deterministic suite and does not change scope.



## Development sequencing

### Build order

1. Backend: `normalize-language`, `country_code` in the parser, `weatherCode` in the contract, and forwarding `language` to the client, with corresponding tests. The contract must exist before frontend consumption.
2. Frontend, i18n core: types, dictionaries, context, `LanguageProvider`, `useTranslation`, and `useDocumentLanguage`, with tests. No screens change yet.
3. Frontend, presentation utilities: `weatherConditionLabel`, `formatMeasurement`, and `countryName`, with full-table and fallback tests.
4. `LanguageToggle` and composition in `App` and `WeatherView`, ensuring accessible name, preserved focus, and header position.
5. Migrate components to `t(...)`, including section `aria-label` and form texts.
6. Error by code: adjust `weather-service`, `useWeatherSearch`, types, and `WeatherFeedback`, removing hardcoded frontend messages.
7. Send `lang` in the query and validate the new fields in the frontend service.
8. Update the Open-Meteo mock, affected existing tests, and add new E2E tests.
9. Final validation: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, and `npm run test:coverage` on frontend; `npm run build`, `npm test`, and `npm run test:coverage` on backend; `e2e/` suite.

### Technical dependencies

- No new dependencies in any of the three projects; no lock file changes because of this feature.
- Environment Node must have full ICU for `Intl.DisplayNames` for regions, a condition already met by project-supported versions and the E2E test browser.
- Order 1 → 7 is mandatory only between backend and step 7; steps 2 through 5 can progress in parallel with backend because they do not depend on the new contract.
- There is no migration, new infrastructure, credentials, or additional environment variable.



## Monitoring and observability

- No new log event. Language is a presentation choice and will not be logged, avoiding unnecessary user data.
- `weather_query_completed` and `weather_provider_failed` keep the same fields. If, in the future, it is necessary to measure English adoption, normalized language could be included as a low-cardinality field, a decision outside this specification.
- `GET /health` remains unrelated to language and without external calls.
- The 300 ms CA-11 limit is verified by E2E-13, not by a production metric: switching does not go through the network.



## Technical considerations

### Main decisions

- **Client-side translation, contract-side data:** confirmed by the user. Exposing `weatherCode` and `countryCode` allows translation without network, which is the only way to simultaneously meet CA-03, CA-08, and CA-11. The backend-translation-via-`lang` alternative would require re-running the query on every switch, with two external calls and failure risk for a purely visual action.
- **`condition` kept as legacy:** preserves PRD-required compatibility without duplicating the 28-code English table in backend. The cost is a redundant field, documented as legacy.
- **City and region not retranslated after switching:** confirmed by the user. Only country has a stable code for local translation; retranslating proper names would require a new geocoding call. Fallback behavior is explicitly covered in RF10.
- **Optional `lang` that never fails:** an unknown language is a presentation detail, not a request error. Falling back to `pt` keeps the contract compatible with clients that do not know the parameter.
- **Custom, minimal i18n:** confirmed by the user. Two languages, about 26 keys, no pluralization or interpolation. A `Record<TranslationKey, string>` turns missing translations into compile-time errors, which a generic library typically handles at runtime. `react-i18next` was discarded due to weight and setup overhead disproportionate to the use case.
- **Error stored by code, not by message:** today the message enters state as text; that would prevent retranslating an already visible error. Storing only the code removes duplication of messages between service and hook and satisfies CA-05 and CA-06.
- **Language via parameter in `search`:** keeps `useWeatherSearch` independent from the i18n layer and testable without provider, respecting flow `view → hooks → services`.
- **No persistence:** product decision recorded in the PRD. Eliminates local storage, cross-tab synchronization, and any user data.
- **No additional live region for switching:** the button’s accessible name and the document `lang` update while focus remains on the button itself, which already triggers announcement. A second live region would compete with loading and error regions.
- **Number format via `Intl`, spacing preserved:** meets RF12 without changing the visual identity defined in `DESIGN.md`.

### Known risks

- English and Portuguese texts have different lengths and may break the header at 360 px. Mitigation: E2E-20 checks both widths in the new language, and the toggle uses a short, stable-width label.
- `Intl.DisplayNames` may not return names for rare codes or in reduced-ICU environments. Mitigation: explicit fallback to received `country`, covered by TU-FE-15.
- Dictionaries may diverge over time. Mitigation: `Record<TranslationKey, string>` type and TU-FE-10 checking parity and non-empty values.
- Duplicated texts across this specification table, dictionaries, and tests may drift. Mitigation: translation tests compare against dictionaries, and only TU-FE-11 hardcodes the full WMO code table.
- `WeatherResponse` change touches existing frontend, backend, and E2E tests. Mitigation: fields are only added, `condition` is preserved, and sequencing updates mock and tests in a dedicated step.
- A result obtained before switching keeps city and region in the previous language, which may be perceived as incomplete translation. Mitigation: behavior specified in RF10 and verified by E2E-12, which validates translated country and preserved proper name.
- `condition` may be confused as an active field by a future consumer. Mitigation: explicit legacy marking in the contract and in this specification.
### Compliance with AGENTS.md and the rules

`AGENTS.md` and all files in `.agents/rules/` were fully read: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `python.md`, and `tests.md`.

- Frontend and backend remain independent, with scripts run in each directory and no `package.json` at the root.
- Backend follows `routes → services → data`: the route reads `lang`, the service normalizes and orchestrates, and the `data` layer builds the external URL. No new import points backward.
- Frontend follows `view → components/hooks → services → backend`; i18n modules do not perform HTTP access, and the HTTP service does not know dictionaries, with no import cycle.
- Limits respected: files up to 100 lines, functions up to 30 lines, React components up to 30 lines, maximum of three parameters. For this reason, dictionaries, WMO labels, and formatters stay in separate files by language and responsibility.
- Explicit typing, no `any`, with refined `unknown` in `lang` validation and HTTP response validation; `const` by default, strict comparisons, arrow functions only in callbacks, and no nested ternaries.
- No comments in code; names and function extraction express intent.
- Each shared type remains in its own file inside `types/`.
- Node: no new blocking operation, no new environment variable, unchanged centralized logging, unchanged graceful shutdown, no package manager switch, and no lock file change.
- Tests: all new code will have tests; pyramid preserved with a unit base, integration at the HTTP contract, and E2E restricted to critical flows; FIRST respected, with no real network in deterministic tests; minimum 80% coverage maintained by already configured thresholds.
- Recorded deviation: the `frontend/src/i18n/` folder will be created, not foreseen in `folder-structure.md`. Justification: dictionaries and language formatters are a clear and recurring responsibility, they are not backend access (`services/`), they are not components, hooks, or types, and distributing them across existing folders would violate the cohesion required by the rule itself. The creation follows the convention of creating a folder only when there is clear responsibility.

### Compliance with skills

- `create-techspec` — applied: PRD analyzed, project and rules explored before questions, four decisions confirmed by the user, template preserved, and specification without implementation.
- `react` — applicable and followed: small components with single responsibility and explicit props, no spread; custom hook with `use` prefix; `useEffect` only to sync the document, which is an external system; no unnecessary `useMemo`; no redundant derived state; functional update in `toggleLanguage`; `button` semantics, accessible name, visible focus, and responsiveness with Tailwind. No planned deviation; the generic `Button` from `components/ui` continues to not be used by this functionality.
- The other skills in `.agents/skills/` (`create-prd`, `create-tasks`, `execute-task`, `execute-review`, `execute-qa`, `impeccable`, `caveman`) do not apply to this specification.

### Relevant and dependent files

Backend to modify:

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

Backend to create:

- `backend/src/services/normalize-language.py`
- corresponding `*.test.ts` tests for the new modules.

Frontend to create:

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
- nearby `*.test.ts` and `*.test.tsx` tests for corresponding modules.

Frontend to modify:

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

E2E to modify or create:

- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/language-switch.spec.ts`
