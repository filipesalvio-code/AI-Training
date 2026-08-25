# Product Requirements Document (PRD)

## Overview

Anyone visiting the existing web app should be able to type a city name and, within a few seconds, see that place’s current temperature and weather condition. The panel is a training MVP for a quick lookup, not a planning or forecasting tool.

The feature lives on the existing frontend and backend. The user never calls weather providers from the browser: the frontend talks only to the application backend, and the backend resolves the city and fetches current conditions from Open-Meteo. When several places share the same name, the system uses the first geocoding result and shows the resolved city, region, and country so the user knows which place was used.

## Goals

- Allow a visitor to complete a current-weather lookup by entering only a city name.
- On 100% of successful lookups, display the resolved location, current temperature in Celsius, and a weather condition in English.
- Complete at least 95% of valid lookups within 3 seconds, measured from search submission to result display, under a normal connection with Open-Meteo available.
- In 100% of expected failure cases (invalid input, city not found, provider unavailable), show a clear, actionable message and keep the search usable.
- Ensure 100% of frontend weather requests go to the application backend, with no direct browser calls to Open-Meteo.
- Keep the panel operable from 360 px width, by keyboard, and with assistive technologies, meeting WCAG 2.2 Level AA for the main flow.

## User stories

- US1: As a visitor, I want to type a city name and submit a search so that I can quickly see the current weather there.
- US2: As a visitor, I want to see the city, region, and country that were actually used so that I know which place the result refers to.
- US3: As a visitor, I want to see the current temperature and weather condition so that I know what it is like there now.
- US4: As a visitor, I want a clear message when my input is invalid, the city is not found, or the service is unavailable so that I know how to try again.
- US5: As a keyboard or assistive-technology user, I want to complete the same search flow without a mouse, color, or icon-only cues so that the panel is usable to me.
- US6: As a visitor, I want to see where the weather data comes from so that I can trust and attribute the source.

## Main features

### City search

The panel offers a labeled city field and a search action. Input accepts city names in common languages, trims extra spaces, and requires at least two meaningful characters.

- RF1: The system must allow submitting a search by city name.
- RF2: The system must reject empty input, whitespace-only input, or input with fewer than two meaningful characters, and tell the user how to correct it.
- RF3: The system must use the first result from the Open-Meteo location search. It must not ask the user to pick among cities with the same name.
- RF4: The system must show the city, available administrative division, and country of the resolved location.

### Weather query through the backend

The backend owns all external weather calls and exposes one operation the frontend can use to request current weather by city name.

- RF5: The backend must turn the submitted name into coordinates using the Open-Meteo Geocoding API.
- RF6: The backend must use the first result’s coordinates to fetch current conditions from the Open-Meteo Weather Forecast API.
- RF7: The frontend must obtain all weather data exclusively from the application backend.
- RF8: The backend must return only what the panel needs to show the resolved place, current temperature, weather condition, and their units.

### Display of current conditions

The result should be readable in a glance: place, temperature, and condition, in English, with metric units.

- RF9: The panel must display the current temperature in degrees Celsius.
- RF10: The panel must display the current weather condition as a short English description (not a raw numeric code).

### States and error recovery

The panel must make loading, success, and failure obvious, and must never mix a new failed search with an old success.

- RF11: While a lookup is in progress, the system must show a loading state and must not start a duplicate submission from the same action.
- RF12: The system must distinguish invalid input, city not found, and temporary service unavailability with different, plain-language messages.
- RF13: After a failure, the city field must remain editable and the user must be able to search again.
- RF14: A previous successful result must not be shown as if it belonged to a later search that failed.

### Source transparency

Open-Meteo data is licensed CC BY 4.0 and requires visible credit wherever it is shown.

- RF15: Next to the weather result, the panel must show attribution to Open-Meteo with a working link to https://open-meteo.com/.

## Acceptance criteria

- CA-01 (US1, RF1, RF5, RF6): Given a city name that Open-Meteo can resolve, when the user submits the search, then the panel shows the current temperature and condition for the first returned location.
- CA-02 (US2, RF3, RF4): Given a name that matches more than one place, when the lookup completes, then the user is not asked to choose a place, and the panel identifies the city, available administrative division, and country of the first result.
- CA-03 (US3, RF9, RF10): Given a successful lookup, when the result is shown, then the panel displays temperature in Celsius and an English weather-condition description, and does not require humidity, wind, or feels-like temperature.
- CA-04 (US1, RF7): Given any search started in the frontend, when network traffic is inspected, then the browser calls only the application backend and does not call Open-Meteo domains.
- CA-05 (US4, RF2): Given empty, whitespace-only, or fewer than two meaningful characters, when the user tries to search, then they see validation guidance and no weather result is shown.
- CA-06 (US4, RF12, RF13): Given a name with no matching locations, when the lookup completes, then the panel says the city was not found and the user can search again.
- CA-07 (US4, RF12–RF14): Given Open-Meteo unavailability or an invalid upstream response, when the lookup fails, then the panel shows a temporary error, does not attach a previous result to this search, and allows retry.
- CA-08 (US4, RF11): Given a lookup in progress, when the user waits, then a loading state is visible and the submit action does not fire duplicate in-flight requests.
- CA-09 (Performance goal): Given a representative set of valid city names and Open-Meteo available, when end-to-end time is measured on a normal connection, then at least 95% of lookups show a result within 3 seconds.
- CA-10 (US5): Given keyboard-only use, when the user moves through the panel, types a city, submits, and reads the result or error, then every control and message is reachable in logical order with a visible focus indicator.
- CA-11 (US5): Given assistive technology, when loading, success, validation, or error states change, then the relevant labels and messages are programmatic and announced, without relying only on color or icons.
- CA-12 (US5): Given viewports of 360 px and 1280 px, when the panel is shown, then content stays readable and operable without horizontal scrolling caused by this feature. Contrast and controls meet WCAG 2.2 Level AA.
- CA-13 (US6, RF15): Given a visible weather result, when the user looks at the panel, then they find Open-Meteo attribution with a working link to https://open-meteo.com/.

## User experience

The audience is any visitor who wants a fast current-weather check. Keyboard, screen-reader, and magnification users complete the same primary flow.

On arrival, the panel has a short title, a persistently labeled city field, and a clear search action. After submit, loading replaces the idle state, then a result or an actionable message. The field stays available for another city.

The result leads with the resolved place, then temperature and condition. Icons and color may support the condition but must not be the only way to read it. Ambiguous names are resolved automatically; the resolved place is always shown so the first-result rule is not a surprise. Copy is English. Temperature is Celsius.

The experience is usable from 360 px, meets WCAG 2.2 Level AA for contrast, focus, labels, and status messages, and explains errors in user language (what happened and what to do next), not internal system terms.

## High-level technical constraints

- The feature must use the existing frontend and backend split. The frontend must not call external weather services; all Open-Meteo traffic goes through the backend.
- City resolution must use the [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/v1/search). Current conditions must use the [Open-Meteo Weather Forecast API](https://api.open-meteo.com/v1/forecast). Both over HTTPS. No user API key.
- The backend operation takes a public city name and must have a consistent outcome for success, validation failure, no matching place, and upstream failure.
- Target: at least 95% of valid lookups finish within 3 seconds end-to-end when Open-Meteo is available.
- The MVP uses the free non-commercial API (under 10,000 calls/day, 5,000/hour, 600/minute). Commercial use or higher volume needs a paid plan and is out of scope.
- Displayed data is CC BY 4.0. The panel must keep the required Open-Meteo attribution next to the result.
- No account, no user API key, and no product history of searched names. City names are not stored as personal data.
- Accuracy and uptime belong to Open-Meteo. The product must report failures and must not promise continuity or absolute accuracy. Open-Meteo disclaims liability for omissions and downtime.

## Out of scope

- Browser geolocation, automatic coordinates, and automatic city suggestion.
- A picker for cities that share the same name; the MVP always uses the first geocoding result.
- Feels-like temperature, humidity, wind, precipitation, pressure, and other extra current metrics.
- Hourly or daily forecasts, history, and comparison between places.
- Severe-weather alerts, notifications, maps, and radar.
- Favorites, search history, accounts, sync, and saved preferences.
- Imperial units and languages other than English.
- Offline mode, a second weather provider, or an Open-Meteo commercial subscription.
