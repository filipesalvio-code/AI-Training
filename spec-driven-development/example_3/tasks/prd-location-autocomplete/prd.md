# Product Requirements Document (PRD)

## Overview

The weather dashboard will start suggesting locations as the user types in the city field. This feature will help anyone find the desired location with less effort and distinguish cities with the same name before checking the weather.

Suggestions will be global and will show city, state or region, and country. When an option is selected, the dashboard will fetch weather data for the selected location, preventing an incorrect namesake city from being used automatically.

## Objectives

- Provide suggestions for input with at least two meaningful characters.
- Display up to five relevant locations, identified by city, available state or region, and country.
- Show suggestions within 500 ms after the last keystroke in at least 95% of queries, under normal connection conditions and with the provider available.
- Ensure that 100% of selected locations are used in weather queries via the coordinates of the selected option.
- Allow the main flow to be completed with mouse, touch, or keyboard only.
- Keep the interface readable and usable on screens from 360 px width and up.

## User stories

- US1: As a user, I want to receive suggestions while typing so I can find a location quickly.
- US2: As a user, I want to see city, state or region, and country in each suggestion so I can distinguish locations with the same name.
- US3: As a user, I want to select a suggestion so I can check the weather for the correct location.
- US4: As a keyboard or assistive technology user, I want to navigate, select, and understand suggestions without relying on a mouse or exclusively visual elements.
- US5: As a user, I want clear guidance when there are no suggestions or when the service is unavailable so I know how to proceed.

## Key features

### Suggestion search

The current city field will offer global suggestions based on the text entered by the user.

- RF1: The system must start searching for suggestions when there are at least two meaningful characters in the field.
- RF2: The system must not search for or display suggestions for empty input, input made only of spaces, or input with fewer than two meaningful characters.
- RF3: The system must update suggestions when the search text changes.
- RF4: The system must display at most five suggestions per query.

### Location identification and selection

Each suggestion must provide enough context to differentiate similar locations.

- RF5: Each suggestion must display the city name, the state or region when available, and the country.
- RF6: The user must be able to select a suggestion using mouse, touch, or keyboard.
- RF7: Arrow keys must allow navigation through suggestions, Enter must select the highlighted option, and Escape must close the list.
- RF8: When selecting a suggestion, the system must close the list and start the weather query using the exact selected location.
- RF9: When there are cities with the same name, the system must allow the user to choose among the displayed options instead of automatically selecting the first result.

### States and failure recovery

The interface must communicate suggestion search outcomes without interrupting use of the field.

- RF10: The system must indicate that suggestions are loading.
- RF11: When there are no matches, the system must indicate that no location was found.
- RF12: When the location service is unavailable, the system must display a clear message and allow a retry by editing the field.
- RF13: Responses from an earlier query must not overwrite suggestions for text typed later.
- RF14: The list must close when the field is cleared, when a suggestion is chosen, when the user presses Escape, or when focus leaves the autocomplete interaction.

## Acceptance criteria

- AC-01 (US1, RF1–RF4): Given that the field contains at least two meaningful characters, when the user stops typing, then the system must display up to five matching suggestions.
- AC-02 (US1, RF2): Given an empty field, a field with only spaces, or a field with fewer than two meaningful characters, when the content changes, then no suggestion search must be started and no list must remain visible.
- AC-03 (US2, RF5): Given a received suggestion, when it is displayed, then it must identify the city, country, and state or region when that information is available.
- AC-04 (US2, US3, RF8, RF9): Given two or more locations with the same name, when the user chooses one of them, then the weather query must use the selected location and the result must identify it correctly.
- AC-05 (US3, RF6): Given a visible suggestion, when the user selects it with mouse or touch, then the list must close and the weather query for that option must be started.
- AC-06 (US4, RF6, RF7): Given an open suggestions list, when the user uses only the keyboard, then they must be able to move through options, select the highlighted one with Enter, and close the list with Escape.
- AC-07 (US5, RF10): Given an ongoing suggestions search, when the user waits for the response, then they must perceive a loading state without losing the typed content.
- AC-08 (US5, RF11): Given a query with no matches, when the search ends, then the system must indicate that no location was found and keep the field editable.
- AC-09 (US5, RF12): Given a location service failure, when the search ends, then the system must indicate unavailability and allow a new attempt after editing the field.
- AC-10 (US1, RF3, RF13): Given that the user quickly changed the search text, when responses are received out of order, then only suggestions matching the current text must be displayed.
- AC-11 (Performance objective): Given a representative set of searches and the provider available, when the time between the last keystroke and display is measured under normal connection conditions, then at least 95% of lists must appear within 500 ms.
- AC-12 (US4): Given the use of assistive technology, when the list opens, loads, receives options, has no results, or fails, then the field, list state, highlighted option, and messages must be identifiable without relying only on color or icons.
- AC-13 (US4): Given screen widths of 360 px and 1280 px, when the list is open, then suggestions must remain readable, selectable, and not cause horizontal scrolling.

## User experience

The audience is the same as the weather dashboard’s: people who want to quickly check current conditions for a location, including keyboard users, screen reader users, touch users, or users with zoom/magnification.

After typing at least two characters, the user will perceive loading and see up to five suggestions below the field. Each option will show city, available state or region, and country. The user can keep typing to refine results, move through options with arrow keys, or select one with mouse, touch, or Enter. Selection will close the list and start the weather query.

The list must remain visually associated with the field, highlight the active option without relying only on color, preserve visible focus, and use an appropriate touch target size. Changes in loading, results, no matches, and errors must be communicated to assistive technologies. On small screens, text may wrap without hiding essential information or creating horizontal scrolling.

## High-level technical constraints

- The feature must respect the existing separation between the React frontend and the Python FastAPI backend.
- The frontend must obtain suggestions exclusively through the application backend, without directly calling external services.
- Global location search must use the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api), which offers partial-name search and city, administrative area, country, and coordinate data.
- The feature must preserve the existing weather query integration with Open-Meteo.
- The performance target is to display suggestions within 500 ms in at least 95% of queries, under normal connection conditions and with the provider available.
- The typed name and suggested or selected locations must not be persisted as product history.
- Use of the provider must comply with its current terms, attribution requirements, and limits applicable to the adopted plan.
- Availability, ordering, and coverage of suggestions depend on the external provider.

## Out of scope

- Automatic geolocation through the browser or by IP address.
- Search by full address, street, or point of interest.
- Search history, favorites, or personalized suggestions.
- Manual creation, editing, or correction of locations.
- Maps or geographic visualization of suggestions.
- Offline operation or use of an alternative provider when Open-Meteo is unavailable.
- Changes to the weather data displayed after location selection.
