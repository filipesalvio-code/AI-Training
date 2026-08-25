# Task 1.0: Backend weather query

## Overview

Implement models, Open-Meteo data client, weather service, `GET /weather`, and pytest coverage (≥80%) with fakes. Keep `GET /health`.

## Subtasks

- [ ] 1.1 Add pydantic models and error types
- [ ] 1.2 Implement `data/open_meteo.py` with parsing and WMO mapping
- [ ] 1.3 Implement `services/weather.py` orchestration
- [ ] 1.4 Wire `routes/weather.py` and update `app.py`
- [ ] 1.5 Add unit and integration tests; run `pytest` with coverage

## Acceptance mapping

CA-01, CA-02, CA-03, CA-05, CA-06, CA-07 (backend side)

## Tests

TU-BE-01–04, TI-BE-01–04, TI-BE-05 (health preserved)
