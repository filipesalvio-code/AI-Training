# Folder structure

Expected layout for frontend, backend, and tests. Application code lives under `src/` unless noted.

## Overview

```text
.
├── frontend/
└── backend/
```

Frontend and backend are independent apps with their own config, dependencies, and scripts.

## Backend

```text
backend/
├── src/
│   ├── routes/
│   ├── services/
│   ├── data/
│   ├── models/
│   ├── app.py
│   └── main.py
├── pyproject.toml
└── .venv/   # local, not committed
```

- `routes/`: HTTP routes; validate inputs and build responses. No business rules.
- `services/`: business rules, protocol-agnostic when possible.
- `data/`: external APIs and persistence.
- `models/`: pydantic models (one concept per file when practical).
- `app.py`: `create_app()` factory.
- `main.py`: uvicorn entrypoint.
- `test_*.py` / `*_test.py`: unit and integration tests next to code.

### Expected flow

```text
HTTP request → routes → services → data → HTTP response
```

## Frontend

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── views/
│   ├── services/
│   ├── hooks/
│   ├── assets/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

- `components/`: reusable UI.
- `views/`: screens that compose components.
- `services/`: backend HTTP clients.
- `hooks/`: shared React hooks.
- `types/`: TypeScript types.

### Expected flow

```text
view → components/hooks → services → backend
```
