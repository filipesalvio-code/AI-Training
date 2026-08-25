# Task 1.0: Set up tests and reorganize the backend runtime

## Overview

Prepare a testable backend foundation, separate FastAPI app composition from uvicorn binding, preserve the health check, and establish configuration, error handling, observability, and controlled shutdown for upcoming deliveries.

<skills>
### Compliance with skills

- `execute-task`: use to implement this task and update its status in `tasks.md` only after all validations pass. - There is no specific backend technical skill in `.agents/skills/`; the project's Python/FastAPI and TypeScript frontend rules are the normative source for this task. </skills>

<rules>
### Compliance with AGENTS.md and rules

`AGENTS.md` and all files in `.agents/rules/` were considered.

- Preserve separation between applications and run dependencies and commands inside `backend/`. - Respect the `configuration → routes → services → data` flow, with no circular dependencies. - Keep `.ts` files up to 100 lines, functions up to 30 lines, and at most three parameters. - Use explicit typing, `const`, strict comparisons, ES modules, `unknown` at boundaries, and never `any`. - Centralize logs, do not log sensitive data or the searched city, and handle `SIGTERM` and `SIGINT` idempotently. - Cover all new code with automated tests and require at least 80% coverage in lines, functions, branches, and statements. - There is no planned deviation from the rules. </rules>

<requirements>
- Configure pytest, coverage, and FastAPI TestClient, and the `test` and `test:coverage` scripts in the backend. - Extract FastAPI app composition to an application that can be tested without binding a port. - Extract and preserve `GET /health` as local liveness, without querying external dependencies. - Keep `src/main.py` responsible only for configuration, server startup, and graceful shutdown. - Centralize expected and unexpected errors in a stable public envelope, without exposing internal details. - Centralize structured logs and prepare the `requestId` context, without persisting or logging unnecessary data. - Read and validate environment configuration at startup, keeping values documented in `.env.example` and no secrets in the repository. - Fix pre-existing unused parameter errors without disabling `noUnusedParameters`. </requirements>

## Subtasks

- [x] 1.1 Add backend test dependencies, update the lockfile, and configure scripts and coverage thresholds. - [x] 1.2 Extract the FastAPI app and health check without changing the existing public contract. - [x] 1.3 Implement environment configuration, application error, error middleware, and structured logger. - [x] 1.4 Simplify startup and implement idempotent graceful shutdown. - [x] 1.5 Create the health check integration test and complementary tests for all new behavior in this foundation. - [x] 1.6 Run backend build, tests, and coverage.

## Implementation details

Follow `techspec.md`, especially “System architecture”, “API Endpoints — GET /health”, “Development sequencing”, “Monitoring and observability”, and “Compliance with AGENTS.md and rules”. In this task, `app.ts` must remain extensible for registering `/weather` in task 2.

## Related acceptance criteria

No PRD criteria are validated directly in this delivery. It preserves the existing health check and establishes the necessary infrastructure for later functional criteria.

## Task tests

In addition to the mapped case below, there must be sufficient complementary tests to cover configuration, error handling, logging, and shutdown whenever there is observable behavior, respecting the minimum 80% coverage.

### Integration tests

- [ ] TI-BE-05 — Preserves isolated health check

## Relevant files

- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `backend/vitest.config.ts`
- `backend/.env.example`
- `backend/src/main.py`
- `backend/src/app.py`
- `backend/src/config/environment.py`
- `backend/src/routes/health-route.py`
- `backend/src/errors/app-error.py`
- `backend/src/middleware/error-handler.py`
- `backend/src/observability/logger.py`
- Tests `*.test.ts` next to their corresponding modules
