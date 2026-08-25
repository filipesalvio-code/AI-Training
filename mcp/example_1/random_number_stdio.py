#!/usr/bin/env python3
"""Random Number MCP server over stdio."""

from __future__ import annotations

import random

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Random Number MCP")


@mcp.tool(name="get_random_number", description="Generate a random number")
def get_random_number() -> str:
    output = random.randrange(0, 100_000)
    return f"Random number: {output}"


@mcp.tool(name="get_random_number_limit", description="Generate a limited random number")
def get_random_number_limit(limit: int | None = None) -> str:
    """Generate a random number below an optional upper bound.

    Args:
        limit: Upper bound (exclusive). Defaults to 100.
    """
    upper = limit if limit is not None else 100
    output = random.randrange(0, upper) if upper > 0 else 0
    return f"Random number: {output}"


if __name__ == "__main__":
    mcp.run(transport="stdio")
