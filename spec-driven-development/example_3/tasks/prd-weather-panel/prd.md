# Product Requirements Document (PRD)

## Overview

The weather panel lets any user check the current weather for a city on a single screen. The user enters a city name, and the system resolves the location and shows temperature, feels-like temperature, weather condition, humidity, and wind in English by default with metric units.

The feature is built on the existing frontend and backend. The frontend talks only to the application backend; the backend queries Open-Meteo geocoding and forecast APIs. When multiple localities share the same name, the system uses the first result and shows the resolved locality for context.

## Goals

- Let users obtain current weather for a city quickly and clearly.
- Keep Open-Meteo integration on the backend only.
- Present metric units and clear condition labels.
- Provide actionable loading, validation, and error states.

## Non-goals

- Multi-day forecasts
- Manual disambiguation among same-name cities beyond showing the first result
- Direct browser calls to Open-Meteo
- Accounts, history, or persistence

## User stories

- As a user, I want to enter a city and see current conditions so I can plan my day.
- As a user, I want clear errors when the city is invalid or not found so I can correct my search.
- As a user, I want to see the resolved locality so I know which place was used.

## Functional requirements

- Search by city name with validation (minimum two meaningful characters).
- Resolve locality via Open-Meteo geocoding on the backend.
- Fetch current conditions via Open-Meteo forecast on the backend.
- Display temperature, feels-like, condition, humidity, and wind with metric units.
- Attribute data to Open-Meteo.
- Expose `GET /health` for infrastructure checks.

## Acceptance criteria

- Valid city returns current weather with resolved locality.
- Invalid or short city returns a clear validation error.
- Unknown city returns a not-found error.
- Upstream failures return a recoverable service-unavailable error.
- Frontend never calls Open-Meteo directly.
