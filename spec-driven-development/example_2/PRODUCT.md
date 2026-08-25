# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Python FastAPI. Existing project stack confirmed by repository.

## Users

Anyone who wants a quick look at the current weather for a city, including people who use a keyboard, screen readers, or magnification. Inferred directly from the PRD.

## Product Purpose

Let the user enter a city and see, on a single screen, the resolved location and current weather conditions in English with metric units. Success means completing valid queries with clear guidance on failure and without the browser calling external weather APIs directly.

## Positioning

The backend resolves the location and centralizes the Open-Meteo integration, while the panel delivers a ready-to-read result attributed to the source.

## Operating Context

A web tool with no account, history, persistence, or manual selection among homonymous cities. The first returned location is used and identified in the result.

## Capabilities and Constraints

City search, idle/loading/success/error states, validation on both sides, current result with five measurements, Open-Meteo attribution, responsiveness from 360 px, and `/health` limited to infrastructure. No future forecasts, geolocation, offline mode, history, or direct browser calls to Open-Meteo.

## Evidence on Hand

PRD and TechSpec in `tasks/prd-weather-panel/`. No logo, images, testimonials, or other external claims were provided; do not invent those materials.

## Product Principles

- Short, direct queries.
- Explicit, contextualized results.
- Actionable, recoverable failures.
- Transparency about the source.
- Accessibility as part of the main flow.

## Accessibility & Inclusion

The flow must be keyboard-operable, compatible with assistive technologies, announce asynchronous changes, and keep focus, contrast, and readability on screens 360 px or wider. Inferred and confirmed by the PRD and TechSpec.
