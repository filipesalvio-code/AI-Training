# Product Requirements Document (PRD)

## Overview

The weather panel will allow any user to view the current weather conditions for a city on a single screen. The user will enter the city name, and the system will resolve the location and display temperature, feels-like temperature, weather condition, humidity, and wind in English and metric units.

The feature will be built into the existing frontend and backend. The frontend will communicate exclusively with the application backend; the backend will be responsible for querying the Open-Meteo geocoding and forecast APIs. When more than one location has the same name, the system will use the first returned result and show the resolved location to provide context to the user.

## Goals

- Allow the user to complete a current weather query by entering only a city name. - Display, in 100% of successfully completed queries, the resolved location, temperature, feels-like temperature, weather condition, humidity, and wind. - Complete at least 95% of valid queries within 3 seconds, measured from search submission to result display, under normal connection conditions and with external dependencies available. - Display clear guidance in 100% of expected scenarios: invalid input, city not found, and external service unavailability. - Ensure that 100% of queries made by the frontend are sent to the application backend, with no direct browser calls to Open-Meteo. - Provide a usable experience on screens from 360 px wide, operable by keyboard and compatible with major assistive technologies.

## User stories

- US1: As a user, I want to search for a city by name so that I can quickly check the current weather in that location. - US2: As a user, I want to see the selected city, region, and country so that I know which location the displayed data refers to. - US3: As a user, I want to view temperature, feels-like temperature, weather condition, humidity, and wind so that I understand the current conditions. - US4: As a user, I want clear messages when the search is incomplete, the city is not found, or the service is unavailable so that I know how to proceed. - US5: As a keyboard or assistive-technology user, I want to fill in, submit, and understand the search and its result without relying on a mouse, color, or visual-only elements. - US6: As a user, I want to identify the source of the weather data so that I understand where the displayed information comes from.

## Main features

### City search

The panel will provide a text field and a search action. Input must accept city names in different languages, ignore extra spaces, and require at least two meaningful characters.

- RF1: The system must allow submitting a city-name search. - RF2: The system must reject empty input, input containing only spaces, or input with fewer than two meaningful characters, and guide the user to correct the search. - RF3: The system must use the first result returned by the Open-Meteo location search, without presenting a selection step between cities with the same name. - RF4: The system must display the city, available administrative division, and country of the resolved location.

### Weather query through backend

The backend will centralize external integration and expose an HTTP operation so the frontend can query current weather by city name.

- RF5: The backend must convert the provided name to coordinates through the Open-Meteo Geocoding API. - RF6: The backend must use the coordinates of the first result to obtain current conditions through the Open-Meteo Weather Forecast API. - RF7: The frontend must obtain all weather data exclusively from the application backend. - RF8: The backend must return to the frontend only the data required to render the result, including units and location metadata.

### Display of current conditions

The result should prioritize quick reading and use English and metric units.

- RF9: The panel must display temperature and feels-like temperature in degrees Celsius. - RF10: The panel must display the current weather condition using a description understandable in English. - RF11: The panel must display relative humidity as a percentage. - RF12: The panel must display wind speed in kilometers per hour.

### States and error recovery

The panel will make it explicit when a query is in progress, has no result, or cannot be completed.

- RF13: The system must show a loading state during the query and prevent accidental duplicate submissions while the query is in progress. - RF14: The system must distinguish invalid input, city not found, and temporary service unavailability through clear messages. - RF15: After a failure, the system must preserve the ability to edit the city and retry the query. - RF16: A previous result must not be shown as if it matched a new search that ended in error.

### Source transparency

The data source must remain visible next to the panel.

- RF17: The panel must display visible attribution to Open-Meteo, with a link to the source, near the weather data.

## Acceptance criteria

- CA-01 (US1, RF1, RF5, RF6): Given a valid city with an Open-Meteo result, when the user submits the search, then the system must display the current conditions for the first returned location. - CA-02 (US2, RF3, RF4): Given a name associated with multiple locations, when the query is completed, then no intermediate selection should be requested, and the panel should identify the city, available administrative division, and country of the first result. - CA-03 (US3, RF9–RF12): Given a successfully completed query, when the panel displays the result, then it must show temperature, feels-like temperature, condition, humidity, and wind with labels in English and metric units. - CA-04 (US1, RF7): Given any search initiated on the frontend, when network requests are inspected, then the browser should query only the application backend and should not call Open-Meteo domains directly. - CA-05 (US4, RF2): Given empty input, input containing only spaces, or input with fewer than two meaningful characters, when the user tries to search, then they should receive validation guidance and no weather results should be displayed. - CA-06 (US4, RF14): Given a search with no matching locations, when it is completed, then the panel should inform that the city was not found and allow a retry. - CA-07 (US4, RF14–RF16): Given unavailability or an invalid response from an external dependency, when the query fails, then the panel should display a temporary error message, should not associate a previous result with the new search, and should allow another attempt. - CA-08 (US4, RF13): Given a query in progress, when the user waits for the response, then they should perceive a loading state, and the submit action should not generate accidental duplicate queries. - CA-09 (Performance objective): Given a representative set of valid queries and available external dependencies, when end-to-end time is measured under normal connection conditions, then at least 95% of queries must display results within 3 seconds. - CA-10 (US5): Given keyboard-only use, when the user navigates the panel, enters the city, starts the search, and accesses a result or error message, then all these actions and information must be available in logical focus order and with a visible focus indicator. - CA-11 (US5): Given the use of assistive technology, when loading, success, validation, or error states change, then relevant labels and messages must be identifiable and announced without relying exclusively on color or icons. - CA-12 (US5): Given screen widths of 360 px and 1280 px, when the panel is displayed, then its content must remain readable and operable, with no horizontal scrolling caused by functionality. - CA-13 (US6, RF17): Given a visible weather result, when the user checks the panel, then they must find Open-Meteo attribution with a working link next to the data.

## User experience

The primary audience is anyone who wants to quickly check the current weather of a city. People who use keyboards, screen readers, or magnification are also part of the audience and must complete the same primary flow.

When accessing the panel, the user will find a title that explains the purpose of the area, a field with a persistent label for the city name, and a clear search action. After submission, the panel will indicate loading and then replace that state with either the result or an actionable message. The field will remain available for searching another city.

The result will highlight current temperature and condition, followed by the other data, without relying only on icons or colors. The resolved location will be explicitly displayed because ambiguous searches will automatically use the first result. The interface will use English, degrees Celsius, percentages, and kilometers per hour.

The experience should be responsive from 360 px, preserve text contrast and AA-level controls, maintain visible focus and logical navigation order, associate programmatic labels with controls, and communicate asynchronous changes to assistive technologies. Validation and error messages should explain the issue and the next possible action, without internal system terminology.

## High-level technical constraints

- The feature must respect the existing separation between the React frontend and the Python FastAPI backend. - The frontend cannot query external weather services directly; all integration must go through the backend. - City resolution must use the [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/v1/search), and current conditions must use the [Open-Meteo Weather Forecast API](https://api.open-meteo.com/v1/forecast), both via HTTPS. - The operation must use city name as public input and return a contract consistent with success, validation error, no result, and external failure scenarios. - The performance target is up to 3 seconds for at least 95% of valid queries, measured end-to-end under normal connection conditions with Open-Meteo available. - The MVP assumes non-commercial use of the free API. The provider’s current limits must be respected; commercial use or volume above allowed limits will require reassessment of the service plan. - Data display must comply with the CC BY 4.0 license and maintain required Open-Meteo attribution next to the panel. - The search must not require an account, user API key, or storage of personal data. The searched name must not be persisted as product history. - Data availability and accuracy depend on Open-Meteo; the product must report failures without promising continuity or absolute accuracy of the external service.

## Out of scope

- Browser geolocation, automatic coordinate detection, and automatic city suggestions. - Manual selection between cities with the same name; the MVP will always use the first geocoding result. - Hourly or daily forecasts, weather history, and comparisons between locations. - Severe weather alerts, notifications, weather maps, or radar. - Favorites, search history, user accounts, sync, or persistent customization. - Switching between metric and imperial units, or support for languages other than English. - Offline operation, proprietary guarantees of data availability, or automatic replacement of Open-Meteo with another provider. - Contracting or setting up an Open-Meteo business plan is outside the MVP.
