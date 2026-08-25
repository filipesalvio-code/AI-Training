from __future__ import annotations

from typing import Any

import asyncpg

FLIGHT_FIELDS = """
  f.id::integer AS id,
  f.flight_number,
  f.origin_code,
  f.destination_code,
  to_char(f.departure_date, 'YYYY-MM-DD') AS departure_date,
  to_char(f.departure_time, 'HH24:MI') AS departure_time,
  to_char(f.arrival_time, 'HH24:MI') AS arrival_time,
  f.duration_minutes,
  f.price,
  al.code AS airline_code,
  al.name AS airline_name,
  ac.registration AS aircraft_registration,
  ac.model AS aircraft_model
"""


def map_flight(row: asyncpg.Record | dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(row["id"]),
        "flightNumber": row["flight_number"],
        "origin": row["origin_code"],
        "destination": row["destination_code"],
        "date": row["departure_date"],
        "departureTime": row["departure_time"],
        "arrivalTime": row["arrival_time"],
        "durationMinutes": int(row["duration_minutes"]),
        "price": float(row["price"]),
        "airline": {
            "code": row["airline_code"],
            "name": row["airline_name"],
        },
        "aircraft": {
            "registration": row["aircraft_registration"],
            "model": row["aircraft_model"],
        },
    }


async def find_flights(
    pool: asyncpg.Pool,
    origin: str,
    destination: str,
    date: str,
) -> list[dict[str, Any]]:
    rows = await pool.fetch(
        f"""
        SELECT {FLIGHT_FIELDS}
        FROM flights f
        JOIN airlines al ON al.id = f.airline_id
        JOIN aircraft ac ON ac.id = f.aircraft_id
        WHERE f.origin_code = $1
          AND f.destination_code = $2
          AND f.departure_date = $3::date
        ORDER BY f.departure_time, f.price
        """,
        origin,
        destination,
        date,
    )
    return [map_flight(row) for row in rows]


async def check_database(pool: asyncpg.Pool) -> None:
    await pool.fetchval("SELECT 1")
