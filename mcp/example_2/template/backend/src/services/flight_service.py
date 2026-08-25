from __future__ import annotations

import re
import unicodedata
from typing import Any

import asyncpg

from src.data.flight_data import find_flights

SUPPORTED_AIRPORTS = ("FLN", "CGH", "GRU")
FIRST_DATE = "2026-06-10"
LAST_DATE = "2026-06-12"

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class FlightServiceError(ValueError):
    """Domain validation / business-rule error (maps to HTTP 400)."""


def is_valid_date(value: str) -> bool:
    if not DATE_RE.match(value):
        return False
    try:
        year, month, day = map(int, value.split("-"))
        return 1 <= month <= 12 and 1 <= day <= 31
    except ValueError:
        return False


def is_valid_time(value: str) -> bool:
    return bool(TIME_RE.match(value))


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value.strip().upper())
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def resolve_airport(value: str, role: str) -> str:
    normalized = normalize_text(value)
    if normalized in {"FLN", "FLORIANOPOLIS"}:
        return "FLN"
    if normalized in {"CGH", "CONGONHAS", "SAO PAULO CONGONHAS"}:
        return "CGH"
    if normalized in {"GRU", "GUARULHOS", "SAO PAULO GUARULHOS"}:
        return "GRU"
    if role == "destination" and normalized in {"SAO PAULO", "SAO PAULO SP"}:
        return "SAO_PAULO"
    label = "Origin" if role == "origin" else "Destination"
    raise FlightServiceError(f"{label} is invalid. Use FLN, CGH, GRU, or São Paulo.")


def resolve_destination_airports(destination: str) -> list[str]:
    airport = resolve_airport(destination, "destination")
    return ["CGH", "GRU"] if airport == "SAO_PAULO" else [airport]


def validate_time(time: str | None, label: str) -> None:
    if time is not None and not is_valid_time(time):
        raise FlightServiceError(f"{label} must be in HH:mm format.")


def to_minutes(time: str) -> int:
    hours, minutes = map(int, time.split(":"))
    return hours * 60 + minutes


async def search_flights(
    pool: asyncpg.Pool,
    *,
    origin: str,
    destination: str,
    date: str,
) -> dict[str, Any]:
    origin_code = origin.strip().upper()
    destination_code = destination.strip().upper()
    travel_date = date.strip()

    if origin_code not in SUPPORTED_AIRPORTS:
        raise FlightServiceError("Invalid origin airport. Use FLN, CGH, or GRU.")
    if destination_code not in SUPPORTED_AIRPORTS:
        raise FlightServiceError("Invalid destination airport. Use FLN, CGH, or GRU.")
    if origin_code == destination_code:
        raise FlightServiceError("Origin and destination must be different.")
    if not is_valid_date(travel_date) or travel_date < FIRST_DATE or travel_date > LAST_DATE:
        raise FlightServiceError(f"Date must be between {FIRST_DATE} and {LAST_DATE}.")

    outbound, returns = (
        await find_flights(pool, origin_code, destination_code, travel_date),
        await find_flights(pool, destination_code, origin_code, travel_date),
    )
    return {
        "search": {
            "origin": origin_code,
            "destination": destination_code,
            "date": travel_date,
        },
        "outboundFlights": outbound,
        "returnFlights": returns,
    }


async def find_best_same_day_trip(
    pool: asyncpg.Pool,
    *,
    origin: str,
    destination: str,
    date: str,
    meeting_start_time: str | None = None,
    meeting_end_time: str | None = None,
    same_day: bool = True,
) -> dict[str, Any]:
    origin_code = resolve_airport(origin, "origin")
    airports_considered = resolve_destination_airports(destination)
    travel_date = date.strip()
    meeting_start = meeting_start_time.strip() if meeting_start_time else None
    meeting_end = meeting_end_time.strip() if meeting_end_time else None

    if origin_code == "SAO_PAULO":
        raise FlightServiceError(
            "Origin must be a specific airport; São Paulo cannot be used as origin."
        )
    if not same_day:
        raise FlightServiceError("This MCP only supports same-day round trips.")
    if not is_valid_date(travel_date) or travel_date < FIRST_DATE or travel_date > LAST_DATE:
        raise FlightServiceError(f"Date must be between {FIRST_DATE} and {LAST_DATE}.")
    validate_time(meeting_start, "meetingStartTime")
    validate_time(meeting_end, "meetingEndTime")
    if meeting_start and meeting_end and to_minutes(meeting_end) <= to_minutes(meeting_start):
        raise FlightServiceError("meetingEndTime must be after meetingStartTime.")

    pairs: list[dict[str, Any]] = []
    for dest in airports_considered:
        search = await search_flights(
            pool, origin=origin_code, destination=dest, date=travel_date
        )
        for outbound in search["outboundFlights"]:
            for return_flight in search["returnFlights"]:
                if meeting_start and to_minutes(outbound["arrivalTime"]) > to_minutes(meeting_start):
                    continue
                if meeting_end and to_minutes(return_flight["departureTime"]) < to_minutes(meeting_end):
                    continue
                pairs.append(
                    {
                        "outbound": outbound,
                        "return": return_flight,
                        "totalPrice": round(outbound["price"] + return_flight["price"], 2),
                    }
                )

    if not pairs:
        raise FlightServiceError("No combination matches the meeting time window.")

    pairs.sort(
        key=lambda pair: (
            pair["totalPrice"],
            to_minutes(pair["outbound"]["departureTime"]),
            to_minutes(pair["return"]["departureTime"]),
        )
    )
    recommendation = pairs[0]
    time_description = (
        f"arrival by {meeting_start} and return departing from {meeting_end}"
        if meeting_start and meeting_end
        else "available schedules"
    )

    return {
        "search": {
            "origin": origin_code,
            "destination": destination.strip(),
            "airportsConsidered": airports_considered,
            "date": travel_date,
            **({"meetingStartTime": meeting_start} if meeting_start else {}),
            **({"meetingEndTime": meeting_end} if meeting_end else {}),
            "sameDay": same_day,
        },
        "recommendation": recommendation,
        "alternatives": pairs[1:4],
        "explanation": (
            f"The best combination is {recommendation['outbound']['destination']} "
            f"({recommendation['outbound']['flightNumber']}) outbound and "
            f"{recommendation['return']['origin']} ({recommendation['return']['flightNumber']}) "
            f"return, totaling R$ {recommendation['totalPrice']:.2f} while respecting {time_description}."
        ),
    }
