# Python and FastAPI rules

These rules apply to the Python backend in this project.

## Prefer async/await

Use `async`/`await` for I/O (HTTP clients, database, file async APIs). Propagate errors with `raise` when the current layer cannot map them to an HTTP response; the route or exception handler converts them to status codes and payloads.

## Do not block the event loop

Avoid long CPU-bound work or synchronous network I/O inside request handlers. Prefer `httpx.AsyncClient` (or equivalent) for outbound HTTP. Offload heavy CPU work to a process pool or background task when needed.

## Environment variables

Load configuration with `python-dotenv` at process start (`load_dotenv()` in `main.py`). Read `PORT`, CORS origins, and upstream URLs from the environment with safe defaults. Never commit secrets.

## Graceful shutdown

Let uvicorn handle SIGINT/SIGTERM. Close shared clients (httpx, DB pools) in FastAPI lifespan hooks when you create them at startup.

## Logging

Log structured, actionable messages (startup, upstream failures). Do not log secrets or full PII. Prefer a small logger module over scattered `print` in production paths; `print` is acceptable in tiny training demos.

## Dependencies

- Declare runtime deps in `pyproject.toml`.
- Lock or pin versions for training reproducibility when practical.
- Install with a virtualenv: `python3.11 -m venv .venv && pip install -e ".[dev]"`.
- Do not commit `.venv/`.

## Module layout

Keep `routes → services → data` unidirectional. Routes validate HTTP and map errors; services hold business rules; data talks to Open-Meteo or other providers. Prefer pydantic models for request/response shapes.

## Testing

Use pytest with FastAPI `TestClient` (or httpx ASGI transport). Mock upstream HTTP with `respx` or a fake provider. Colocate tests as `test_*.py` or `*_test.py` under `src/`.
