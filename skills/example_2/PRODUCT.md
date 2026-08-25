# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who need a quick look at the current weather for a city. The inferred use case is a short query on desktop or mobile to decide activities and travel.

## Product Purpose

A weather app that lets users search a city and see current conditions, including temperature, feels-like, humidity, and wind. Success means the weather state is immediately understandable.

## Positioning

The interface turns the real data returned for each city into a visual atmosphere that matches temperature and conditions, without hiding essential information.

## Operating Context

The confirmed flow is: search a city name, wait for the query, read the current condition. The app uses a local weather API.

## Capabilities and Constraints

- City search via `http://localhost:3000/weather`.
- Shows temperature, feels-like, humidity, wind, condition, place, and country.
- Allows toggling Celsius and Fahrenheit.
- Must preserve loading, error, and validation states.

## Brand Commitments

Requested direction: futuristic, bold, and innovative, with high contrast and colors that reflect each city's temperature and conditions.

## Evidence on Hand

The only confirmed weather data is returned by the API and defined in `frontend/src/types/weather.ts`. There are no external images, brand assets, or claims to incorporate.

## Product Principles

- Current conditions should be clear at a glance.
- Visual atmosphere follows the data; it never replaces it.
- High contrast must keep the UI readable in all conditions.
- Searching a city must stay fast and direct.
