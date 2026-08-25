# Product Requirements Document (PRD)

## Overview

The weather panel currently displays temperature and feels like exclusively in degrees Celsius. Users accustomed to the Fahrenheit scale need to mentally convert the values or resort to another tool, interrupting a query that should be resolved on a single screen. This functionality adds a temperature unit switch to the query result, allowing users to read the same data in °C or °F without redoing the search.

The switch is a display preference and occurs entirely on the frontend: the backend continues to deliver data in degrees Celsius, and the HTTP contract remains unchanged. The choice lasts while the page is open, including between different searches, and reverts to the Celsius default on each new load. The scope is limited to temperature and feels like; humidity and wind remain in percentage and kilometers per hour.

## Objectives

- Allow reading of temperature and feels like in °F with a single interaction from any already displayed result.
- Update displayed values without any additional network requests: 0 calls to the backend per unit switch.
- Reflect the chosen unit in 100% of the visible temperature values on the panel, including the highlighted value and feels like.
- Present correct converted values in 100% of cases, according to the formula `°F = °C × 9/5 + 32`, rounding to the nearest integer.
- Update the panel within 100 ms after interaction, without showing a loading state and without losing the current result.
- Maintain the chosen unit in 100% of subsequent queries made in the same page session.
- Keep the switch operable by keyboard and with a perceptible active state for assistive technologies, without relying solely on color.

## User Stories

- US1: As a user accustomed to the Fahrenheit scale, I want to switch the displayed temperature unit to interpret the result without making mental conversions.
- US2: As a user, I want the feels like to match the chosen unit so that I do not compare two values in different scales.
- US3: As a user, I want to clearly identify which unit is active so that I do not interpret a value in the wrong scale.
- US4: As a user, I want the chosen unit to remain valid when searching for another city so that I do not have to repeat the switch for each query.
- US5: As a keyboard or assistive technology user, I want to reach, activate, and understand the switch and the effect of the change without relying on a mouse or color.
- US6: As a user, I want to switch the unit without losing the displayed result or waiting for a new query.

## Key Features

### Temperature Unit Switch

A two-option control, `°C` and `°F`, is placed next to the query result. It makes both units available simultaneously for reading and indicates which is active, avoiding the ambiguity of a switch that shows only one state. Since it belongs to the result block, it only appears when there is a result to convert.

- RF1: The panel must offer a control with the options `°C` and `°F` next to the query result.
- RF2: The control must indicate the active unit through label and state, without relying solely on color.
- RF3: The control must be visible only when there is a displayed weather result, remaining absent in initial, loading, and error states.
- RF4: Selecting the already active unit must not change the displayed content.

### Conversion and Display of Values

The conversion is applied in the presentation, based on the Celsius data received from the backend.

- RF5: The panel must convert the temperature and feels like from °C to °F using the formula `°F = °C × 9/5 + 32` when the active unit is Fahrenheit.
- RF6: The panel must display temperature values rounded to the nearest integer in both units.
- RF7: The panel must display the symbol of the active unit (`°C` or `°F`) next to each temperature value.
- RF8: Relative humidity and wind speed must remain in percentage and kilometers per hour, regardless of the chosen temperature unit.
- RF9: The unit switch must not generate any requests to the backend or alter the API contract.

### Persistence of Choice in Page Session

The preference follows the continuous use of the panel without becoming a stored user data.

- RF10: The chosen unit must remain applied to subsequent queries while the page is not reloaded.
- RF11: The default unit must be Celsius on each page load.
- RF12: The choice must not be saved in local storage, cookies, backend, or any persistent means.

### Accessibility of the Control

The switch integrates into the main flow and needs to be usable under the same conditions as the search.

- RF13: The control must be reachable and actionable only by keyboard, with a visible focus indicator.
- RF14: The control must expose an accessible label that identifies its purpose and the unit corresponding to each option.
- RF15: The active unit must be programmatically exposed to assistive technologies.

## Acceptance Criteria

- CA-01 (US1, RF1, RF5, RF7): Given a result displayed in Celsius, when the user selects `°F`, then the temperature must be presented converted and accompanied by the symbol `°F`.
- CA-02 (US2, RF5): Given a result displayed in Fahrenheit, when the panel is read, then the feels like must be in the same unit as the highlighted temperature.
- CA-03 (US1, RF5, RF6): Given a temperature of 0 °C, 23 °C, and -5 °C, when the active unit is Fahrenheit, then the displayed values must be 32 °F, 73 °F, and 23 °F, respectively.
- CA-04 (US3, RF2, RF15): Given the visible switch, when the user or an assistive technology inspects the control, then the active unit must be identifiable by label and state, without relying solely on color.
- CA-05 (US6, RF9): Given a unit switch, when network requests are inspected, then no new request must be triggered, and the displayed result must be maintained.
- CA-06 (US6, RF9): Given a unit switch, when the panel is updated, then no loading state must be presented.
- CA-07 (US4, RF10): Given the selected Fahrenheit unit, when the user searches for another city in the same page session, then the new result must be displayed in Fahrenheit.
- CA-08 (US4, RF11): Given the selected Fahrenheit unit, when the page is reloaded, then the panel must revert to displaying values in Celsius.
- CA-09 (RF8): Given the active Fahrenheit unit, when the panel displays humidity and wind, then these values must remain in percentage and kilometers per hour.
- CA-10 (RF3): Given the initial, loading, and error states, when the panel is displayed, then the unit switch must not be present.
- CA-11 (US5, RF13, RF14): Given exclusive keyboard use, when the user navigates the panel, then they must reach the switch in logical focus order, see the focus indicator, and switch the unit without using the mouse.
- CA-12 (RF4): Given the active Celsius unit, when the user selects `°C` again, then the displayed values must remain unchanged.
- CA-13 (Responsiveness Objective): Given screen widths of 360 px and 1280 px, when the switch is displayed next to the result, then it must remain readable and operable, without causing horizontal scrolling due to the functionality.

## User Experience

The audience is the same as for the weather panel: anyone quickly checking the weather of a city, including those using keyboards, screen readers, or magnification. The need addressed is specific and frequent among users accustomed to Fahrenheit or who share the information with someone using that scale.

The flow remains the same: the user searches for a city and receives the result in Celsius. Next to the result block, near the highlighted temperature, a switch appears with both units. When `°F` is activated, the temperature and feels like are immediately recalculated, keeping locality, condition, humidity, wind, and source attribution in place. There is no intermediate step, confirmation, or wait. When `°C` is activated, the panel returns to the original reading.

The switch communicates its state through text and programmatic state, not just by color or fill. It participates in the focus order of the result, displays a visible focus indicator, and maintains text contrast at AA level. On screens from 360 px, the control follows the vertical flow of the result without causing horizontal scrolling.

In subsequent queries in the same page session, the chosen unit remains active, avoiding the need to repeat the switch for each search. Upon reloading the page, the panel returns to the Celsius default, consistent with the language and primary regional context of the product.

## High-Level Technical Constraints

- The conversion must occur exclusively on the frontend. The backend continues to return temperature and feels like in degrees Celsius, and the existing HTTP contract must not be altered.
- The functionality must not introduce new external integrations, network dependencies, or additional calls to the backend.
- The unit preference must not be persisted in `localStorage`, `sessionStorage`, cookies, backend, or any other means, maintaining the product's restriction of not storing user data.
- The functionality must respect the existing separation between the React frontend and the Python FastAPI backend and the layered architecture already adopted in the frontend.
- The converted display must preserve the attribution required to Open-Meteo and the CC BY 4.0 license already present in the panel.
- The change must maintain the minimum automated test coverage of 80% defined for the project, covering conversion, unit switching, and preservation of choice between searches.
- This PRD partially revises the exclusion of "switching between metric and imperial units" recorded in the PRD of the weather panel: the revision applies only to temperature, and other measures remain metric.

## Out of Scope

- Conversion of wind speed to miles per hour, knots, or any other imperial unit.
- Conversion of other quantities, such as pressure, precipitation, or visibility, and support for the Kelvin scale.
- Persistence of preference between sessions, by user, by device, or by synchronization.
- Automatic detection of the unit by browser language, queried locality, or geolocation.
- Alteration of the backend contract, sending the desired unit in the request, or conversion on the server.
- Global unit switch outside the result block or available before the first query.
- Simultaneous display of both units in the same value, such as `23 °C (73 °F)`.
- Support for other languages, regional numeric formats, or alteration of displayed decimal places.
