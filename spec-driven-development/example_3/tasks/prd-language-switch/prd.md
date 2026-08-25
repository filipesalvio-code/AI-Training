# Product Requirements Document (PRD)



## Overview

The weather dashboard is currently presented exclusively in Brazilian Portuguese, which hinders comfortable use by people who do not read this language. This feature will add the ability to switch between Brazilian Portuguese (pt-BR) and English (en) via an easily accessible toggle button, visible in the header of the dashboard. When the button is activated, all displayed content immediately switches to the other language, without reloading the page and without the user needing to repeat the ongoing or already completed query.

The scope of the translation encompasses the entire experience: titles, labels, supporting texts, placeholders, buttons, loading messages, validation and error messages, measurement labels, source attribution, and also the weather condition descriptions currently delivered by the backend in Portuguese. The units remain metric in both languages (°C, % and km/h); only the numerical formatting follows the convention of the active language. The choice persists while the page is open, and the default language reverts to pt-BR with each new load.

## Objectives

- Allow switching between pt-BR and en with a single action, from any state of the panel (initial, loading, success, or error).
- Translate 100% of the visible textual content of the panel in all four states, ensuring no text remains in the previous language after the switch.
- Reflect the switch within 300 ms from the action, without reloading the page and without requiring the user to redo the query.
- Preserve, in 100% of the switches, the content entered in the city field and the already displayed weather result.
- Keep the declared language of the document consistent with the active language in 100% of the switches, for screen readers and correct pronunciation.
- Ensure the language control is operable by keyboard and identifiable by assistive technology, with the active language communicated without relying solely on color, on screens 360 px wide and above.
- Do not degrade the existing panel goals: valid queries continue to complete within 3 seconds in at least 95% of cases.

## User Stories

- US1: As a user who reads English, I want to switch the panel's language with one click to understand the interface without relying on external translation.
- US2: As a user, I want to find the language control immediately upon opening the panel so I don't have to search through menus or scroll the page.
- US3: As a user who has already queried a city, I want to switch the language and continue seeing the same result translated so I don't have to redo the search.
- US4: As a user who reads English, I want the weather condition description to appear in English to understand the weather without interpreting terms in Portuguese.
- US5: As a user who received a validation or error message, I want to read it in the chosen language to know how to proceed.
- US6: As a keyboard or screen reader user, I want to reach, activate, and understand the language control and perceive the content change without relying on a mouse or visual indication alone.
- US7: As a user who switched to English, I want to see numbers in the language's format to read values without ambiguity between comma and decimal point.

## Main Features

### Language Switch Control

A toggle button will be located in the header of the panel, above the search area, visible without scrolling on all supported widths. It indicates the active language and switches to the other language with each activation.

- RF1: The system must display a language control in the header of the panel, visible without scrolling on screens from 360 px in width.
- RF2: The control must toggle between pt-BR and en with a single activation, without intermediate steps.
- RF3: The control must communicate which is the active language and which will be the resulting language from the activation, through text and not just by color or icon.
- RF4: The control must remain available and actionable in the initial, loading, success, and error states.

### Translation of Panel Content

All text produced by the product must exist in both languages, including accessibility support elements that are not visible on the screen.

- RF5: The system must present in the active language the title of the panel, introductory texts, the label and placeholder of the city field, the text of the search button at rest and during loading, the labels of the measurements, the text of the resolved locality, the footer, and the attribution of the source.
- RF6: The system must present in the active language the loading messages, input validation, and error messages, including the guidance for retrying.
- RF7: The system must present in the active language the non-visible accessible labels, such as names of regions and descriptions associated with controls.
- RF8: The system must not display any product text in the previous language after the switch.

### Translation of Weather Content

The description of the current condition is currently delivered in Portuguese by the backend and needs to follow the active language, as it is one of the most read pieces of information in the result.

- RF9: The system must display the description of the current weather condition in the active language, covering all conditions already supported by the panel.
- RF10: The system must present the resolved locality — city, available administrative division, and country — in the active language when the data provider offers this designation; when not offered, it must display the received designation without alteration.
- RF11: The language switch must not change the displayed units, which remain in degrees Celsius, percentage, and kilometers per hour in both languages.
- RF12: The system must format numerical values according to the convention of the active language, using a comma as a decimal separator in pt-BR and a period in en.

### Continuity of State During the Switch

Switching the language is a presentation change and should not cost the user the work already done.

- RF13: The language switch must preserve the text entered in the city field.
- RF14: The language switch must preserve the displayed weather result, re-presenting it translated, without requiring a new search from the user.
- RF15: The language switch during an ongoing query must not cancel that query, and the result or corresponding error must be presented in the active language at the time of display.
- RF16: The language switch must preserve a visible validation or error message, re-presenting it translated.
- RF17: The language switch must not reload the page or take the user to another address.

### Default Language and Duration of Choice

The preference applies to the current reading session and is not stored.

- RF18: The system must start in pt-BR on every page load, regardless of the language set in the browser.
- RF19: The system must not persist the language choice between loads, and a new load must return to the default language.

### Declared Language of the Document

The language declaration supports correct reading by assistive technologies and must not lag behind what is on the screen.

- RF20: The system must declare the page language according to the active language and update this declaration with each switch.
- RF21: The system must present the page title in the active language.

## Acceptance Criteria

- CA-01 (US1, US2, RF1–RF3): Given the newly loaded panel at any width from 360 px, when the user observes the header without scrolling the page, then they should find the language control indicating the active language, and upon activating it once, the panel should switch to the other language.
- CA-02 (US1, RF5, RF8): Given the panel in pt-BR in the initial state, when the user switches to en, then the title, introductory texts, field label and placeholder, button text, footer, and attribution should be in English, with no product text remaining in Portuguese.
- CA-03 (US3, US4, RF9, RF14): Given a successfully completed query displaying the result, when the user switches the language, then the same result should remain visible, with measure labels, resolved locality text, and weather condition description in the new language, without the user having to redo the search.
- CA-04 (US4, RF9): Given any weather condition supported by the panel, when the result is displayed in en, then the corresponding description should be in English, and no supported condition should appear in Portuguese.
- CA-05 (US5, RF6, RF16): Given an invalid city validation message visible on the screen, when the user switches the language, then the message should remain visible and be displayed in the new language.
- CA-06 (US5, RF6, RF16): Given a city not found error or service unavailability visible on the screen, when the user switches the language, then the error message and retry guidance should be displayed in the new language, and the retry should remain possible.
- CA-07 (US3, RF13): Given text entered in the city field and not yet submitted, when the user switches the language, then the entered text should remain unchanged in the field.
- CA-08 (RF15): Given a query in progress, when the user switches the language before the response, then the query should not be canceled, the loading message should appear in the new language, and the result or error should be presented in the active language when displayed.
- CA-09 (US7, RF11, RF12): Given a result with decimal values, when the panel is in pt-BR and then in en, then the units should remain °C, % and km/h in both languages, and the decimal separator should be a comma in pt-BR and a point in en.
- CA-10 (RF10): Given a resolved locality whose country and administrative division have a name in the active language provided by the provider, when the result is displayed, then this name should be presented in the active language; when there is no corresponding name, then the received name should be displayed unchanged and without error.
- CA-11 (RF17, response objective): Given a language switch, when the user activates the control, then the content should be updated within 300 ms, without reloading the page and without changing the address displayed in the browser.
- CA-12 (US6, RF20, RF21): Given the switch to en, when the declared language of the document and the page title are checked, then both should match the active language, and the same should apply when returning to pt-BR.
- CA-13 (US6, RF3, RF4): Given exclusive keyboard use, when the user navigates through the panel, then the language control should be reachable in logical focus order, present a visible focus indicator, be actionable by keyboard, and maintain focus on a predictable element after the switch.
- CA-14 (US6, RF3, RF7): Given the use of assistive technology, when the user finds the language control and activates it, then the control name, active language, and language change should be identifiable without relying solely on color or icon, and the non-visible accessible labels should be in the active language.
- CA-15 (RF18, RF19): Given a switch to en followed by a page reload, when the panel is displayed again, then it should be in pt-BR, even if the browser is set to English.
- CA-16 (RF1, supported widths): Given screen widths of 360 px and 1280 px, when the panel is displayed in either language, then the translated content should remain readable and operable, without horizontal scrolling and without overlapping elements caused by longer texts.
- CA-17 (non-regression objective): Given the existing search flow, when valid queries are executed in either language, then they should continue to complete within 3 seconds in at least 95% of cases, and the browser should continue querying only the application backend.

## User Experience

The main audience continues to be anyone who wants to quickly check the current weather in a city, now explicitly including those who read English and do not read Portuguese. People who use keyboards, screen readers, or magnification are part of this audience and should complete the same flow, including the language switch.

When opening the panel, the user sees the header with the area identifier, the title, and, in the same block, the language control. The control is a single action that shows the active language and toggles to the other. One activation is enough: the screen content is rewritten in the new language, the city field retains what was typed, and the result, if any, remains in the already translated place. Nothing is lost, and no search needs to be redone.

The switch works in any state. During loading, the waiting message appears translated, and the query continues in progress. In case of error or validation, the message and guidance for a new attempt are presented again in the chosen language, preserving the possibility to correct the city and try again. In the result, both the labels of the measurements and the description of the condition and the attribution of the source accompany the language.

The experience maintains the requirements already established for the panel: responsiveness from 360 px, text and control contrast at level AA, visible focus, logical navigation order, programmatic labels associated with controls, and announcement of asynchronous changes. Texts in English and Portuguese have different lengths, and the layout must absorb this variation without breaking alignments, truncating labels, or causing horizontal scrolling. The declared language of the document accompanies the active language so that synthesized reading uses the correct pronunciation.

## High-Level Technical Constraints

- The functionality must preserve the existing separation between the React frontend and the Python FastAPI backend, and the frontend must continue to exclusively query the application backend.
- The existing HTTP contract for the weather query must remain compatible for current consumers; the necessary evolution to deliver the weather condition in the active language cannot break the already agreed behavior.
- Backend error codes must remain stable and language-independent; the text displayed to the user is the responsibility of the presentation layer.
- The supported languages are pt-BR and en. Introducing external automatic translation services is not allowed; translated content is maintained by the product itself.
- The naming of locations depends on what the data provider offers by language. When the name in the active language is not available, the display must degrade to the received value without error.
- Attribution to Open-Meteo and the CC BY 4.0 license must remain visible and intact in both languages, as already required by the panel.
- Language preference cannot be persisted in local storage, cookies, or server, and no additional personal data can be collected due to this functionality.
- The switch must be reflected within 300 ms without reloading the page, and the functionality cannot compromise the goal of 3 seconds for at least 95% of valid queries.
- Accessibility must meet the AA level of WCAG 2.1 in applicable aspects, including the page language declaration, visible focus, and programmatic identification of the control.
- Units remain metric in both languages; no unit conversion can be introduced by this functionality.

## Out of Scope

- Support for a third language or regional variants beyond pt-BR and en.
- Persistence of language choice between loads, sessions, or devices, through local storage, cookies, accounts, or profiles.
- Automatic detection of language by the browser, request header, or geolocation.
- Distinct addresses by language, route prefixes, language URL parameters, `hreflang`, sitemap, and other multi-language SEO optimizations.
- Conversion between metric and imperial units, which remains out of the product's scope.
- Translation by external service, automatic translation of content, or translation of texts generated by third parties other than condition descriptions and locality names.
- Localization of time zones, dates, long times, and calendars, which are not displayed by the dashboard.
- Translation of logs, internal messages, repository documentation, and administrative content.
- Support for languages written from right to left and corresponding layout adaptations.
- Elaborate animations or transitions for language switching beyond immediate content updates.
