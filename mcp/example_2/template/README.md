# AeroBusca

Simple flight search between FLN, CGH, and GRU, with a FastAPI/Python backend, PostgreSQL, and a React/Vite frontend.

## Start the database

From `template/` (if a compose file is present):

```bash
docker compose up -d
```

PostgreSQL creates the `airlines`, `aircraft`, and `flights` tables and seeds flights from 2026-06-10 through 2026-06-12. There are 8 daily departures each way on FLN ↔ CGH and FLN ↔ GRU.

To recreate on a clean volume:

```bash
docker compose down -v
docker compose up -d
```

## Run the application

Backend (Python 3.11):

```bash
cd backend
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
python -m src.main
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## API

Health check:

```bash
curl http://localhost:3000/health
```

Same-day round-trip search:

```bash
curl 'http://localhost:3000/api/flights/search?origin=FLN&destination=CGH&date=2026-06-10'
```

The response includes `outboundFlights` and `returnFlights`. Search accepts only dates from 2026-06-10 to 2026-06-12.

## MCP via Streamable HTTP

The same backend exposes an MCP server at:

```text
http://localhost:3000/mcp
```

Transport is Streamable HTTP with MCP sessions (`POST`, `GET`, `DELETE`). Tools reuse the application service layer.

Available tools:

- `search_flights`: list same-day outbound and return flights for an origin, destination, and date.
- `find_best_same_day_trip`: when the destination is “São Paulo”, compare CGH and GRU, filter outbound to arrive before the meeting and return to leave after it, and return the cheapest combination plus alternatives.

Example arguments for the best-combination tool:

```json
{
  "origin": "FLN",
  "destination": "São Paulo",
  "date": "2026-06-10",
  "meetingStartTime": "10:00",
  "meetingEndTime": "17:00",
  "sameDay": true
}
```

Point an MCP Streamable HTTP client at `http://localhost:3000/mcp`.

## Backend layout

- `src/routes`: HTTP layer and query-parameter checks
- `src/services`: search orchestration and validations
- `src/data`: PostgreSQL access via asyncpg
- `src/mcp`: MCP tool registration
- `database/init`: schema, indexes, relationships, and seed data

## Tests

```bash
cd backend
pytest
```
