#!/usr/bin/env python3
"""Random Number MCP server over Streamable HTTP."""

from __future__ import annotations

import random
from datetime import datetime

from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "Random Number MCP",
    host="0.0.0.0",
    port=3000,
    streamable_http_path="/mcp",
    stateless_http=True,
    json_response=True,
)


@mcp.tool(name="get_random_number", description="Generate a random number")
def get_random_number() -> str:
    output = random.randrange(0, 100_000)
    print("get_random_number", output, datetime.now())
    return f"Random number: {output}"


@mcp.tool(name="get_random_number_limit", description="Generate a limited random number")
def get_random_number_limit(limit: int | None = None) -> str:
    """Generate a random number below an optional upper bound.

    Args:
        limit: Upper bound (exclusive). Defaults to 100.
    """
    upper = limit if limit is not None else 100
    output = random.randrange(0, upper) if upper > 0 else 0
    print("get_random_number_limit", output, datetime.now())
    return f"Random number: {output}"


if __name__ == "__main__":
    print("/mcp listening on http://0.0.0.0:3000/mcp")
    mcp.run(transport="streamable-http")
