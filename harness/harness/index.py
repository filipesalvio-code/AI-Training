#!/usr/bin/env python3
"""Minimal OpenRouter harness request."""

from __future__ import annotations

import json
import os
import sys

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/responses"


def main() -> None:
    api_key = os.environ.get("OPENROUTER_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_KEY environment variable is required")

    response = httpx.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "deepseek/deepseek-v4-flash",
            "input": "There is a bug in the hello world file. Can you fix it?",
        },
        timeout=120.0,
    )
    response.raise_for_status()
    output = response.json()
    print(json.dumps(output.get("output"), indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # noqa: BLE001
        print(error, file=sys.stderr)
        sys.exit(1)
