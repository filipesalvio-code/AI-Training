# Project context

## Coding standards

See [`.agents/rules/code-standards.md`](.agents/rules/code-standards.md) for coding standards that apply to the frontend and backend.

See [`.agents/rules/javascript-typescript.md`](.agents/rules/javascript-typescript.md) for JavaScript and TypeScript rules used by the frontend (const preference, strict equality, typing, arrow functions, ternaries, and linting).

For Python, FastAPI, async I/O, environment variables, shutdown, logging, and dependency management, see [`.agents/rules/python.md`](.agents/rules/python.md).

For React components, hooks, accessibility, and styling, see [`.agents/rules/react.md`](.agents/rules/react.md) when present, or the `react` skill.

## Test rules

See [`.agents/rules/tests.md`](.agents/rules/tests.md) for automated testing rules, minimum coverage, FIRST, the test pyramid, pytest, Vitest, Playwright, and E2E layout.

This repository has two independent apps, frontend and backend. Run commands inside the matching app folder; there is no root package manager lockfile for both.

## Project structure

See [`.agents/rules/folder-structure.md`](.agents/rules/folder-structure.md) for frontend, backend, and test layout.

## Frontend

- Role: web UI that consumes the backend API.
- Stack: React 19, TypeScript, Vite, Tailwind CSS, ESLint.
- Directory: `frontend/`.
- Dev URL: `http://localhost:5173` (Vite default).
- API base: `http://localhost:3000`.

## Backend

- Role: HTTP API.
- Stack: Python 3.11+, FastAPI, uvicorn, httpx, pydantic, python-dotenv.
- Directory: `backend/`.
- Dev/production: `http://localhost:3000` by default.
- Port: `PORT` env var, default `3000`.
- Health check: `GET /health`.
- Weather: `GET /weather?city=`.

## Prerequisites

Node.js and npm for the frontend. Python 3.11+ for the backend.

## Install

```bash
cd frontend
npm install

cd ../backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Development

```bash
# terminal 1
cd backend
source .venv/bin/activate
uvicorn src.main:app --reload --port 3000

# terminal 2
cd frontend
npm run dev
```

Backend: `http://localhost:3000`. Frontend: `http://localhost:5173`.

## Tests and build

### Frontend

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
npm test
```

### Backend

```bash
cd backend
source .venv/bin/activate
pytest
```

<critical>ALWAYS FOLLOW THE TEST RULES IN .agents/rules/tests.md and implement tests for produced code</critical>
