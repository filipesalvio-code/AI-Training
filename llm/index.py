#!/usr/bin/env python3
"""Minimal Ollama chat example."""

from __future__ import annotations

import httpx

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3-vl:2b"


def main() -> None:
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": "Hello, how are you?",
            },
        ],
        "stream": False,
    }

    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            OLLAMA_URL,
            headers={"Content-Type": "application/json"},
            json=payload,
        )

    if not response.is_success:
        raise RuntimeError(
            f"Ollama responded with {response.status_code}: {response.text}"
        )

    output = response.json()
    print(output["message"]["content"])


if __name__ == "__main__":
    main()
