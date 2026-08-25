from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from src.services.flight_service import FlightServiceError, find_best_same_day_trip, search_flights

_pool: Any = None


def set_pool(pool: Any) -> None:
    global _pool
    _pool = pool


def create_flight_mcp() -> FastMCP:
    mcp = FastMCP(
        "aerobusca-flights",
        instructions=(
            "Use find_best_same_day_trip when the user describes a trip with meetings "
            "or wants the best round-trip combination. For a plain listing without "
            "optimization, use search_flights."
        ),
        host="0.0.0.0",
        port=3000,
        streamable_http_path="/",
        json_response=True,
    )

    @mcp.tool(
        name="search_flights",
        title="Search round-trip flights",
        description="List same-day outbound and return flights between two airports.",
    )
    async def search_flights_tool(origin: str, destination: str, date: str) -> str:
        """Search flights.

        Args:
            origin: Origin airport, e.g. FLN.
            destination: Destination airport: CGH, GRU, or São Paulo for both.
            date: Travel date in YYYY-MM-DD format.
        """
        try:
            result = await search_flights(
                _pool, origin=origin, destination=destination, date=date
            )
            return json.dumps(result, indent=2)
        except Exception as error:  # noqa: BLE001
            return str(error) or "Error searching flights."

    @mcp.tool(
        name="find_best_same_day_trip",
        title="Find best combination for a meeting",
        description=(
            "Find the cheapest same-day round trip. Outbound arrives by meetingStartTime "
            "and return departs from meetingEndTime. When destination is São Paulo, "
            "compares CGH and GRU and picks the lowest total."
        ),
    )
    async def find_best_same_day_trip_tool(
        origin: str,
        destination: str,
        date: str,
        meetingStartTime: str | None = None,
        meetingEndTime: str | None = None,
        sameDay: bool = True,
    ) -> str:
        """Find best same-day trip.

        Args:
            origin: Origin, usually FLN.
            destination: Destination — São Paulo, CGH, or GRU.
            date: Date in YYYY-MM-DD format.
            meetingStartTime: Meeting start time HH:mm.
            meetingEndTime: Meeting end time HH:mm.
            sameDay: Keep round trip on the same day; must stay true.
        """
        try:
            result = await find_best_same_day_trip(
                _pool,
                origin=origin,
                destination=destination,
                date=date,
                meeting_start_time=meetingStartTime,
                meeting_end_time=meetingEndTime,
                same_day=sameDay,
            )
            return json.dumps(result, indent=2)
        except FlightServiceError as error:
            return str(error)
        except Exception as error:  # noqa: BLE001
            return str(error) or "Error finding the best combination."

    return mcp
