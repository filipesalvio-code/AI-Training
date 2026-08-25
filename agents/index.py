#!/usr/bin/env python3
"""OpenRouter coding agent with a bash tool loop."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from typing import Any

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/responses"

model = "openai/gpt-5.6-luna"
reasoning: dict[str, Any] = {
    "effort": "medium",
    "exclude": False,
}
log: Any = None

tools = [
    {
        "type": "function",
        "name": "bash",
        "description": "Run bash commands. Use to list, edit, and execute files.",
        "parameters": {
            "type": "object",
            "properties": {
                "command": {"type": "string"},
            },
            "required": ["command"],
            "additionalProperties": False,
        },
    }
]

SYSTEM_PROMPT = """
You are a coding agent specialized in software development.

Follow these rules:

* Always respond in English; never reply in another language
* Never answer topics unrelated to programming
* Be concise; avoid replies longer than 5 lines
* Accept only English questions about programming; if the user asks in another language, ask them to rephrase in English about programming
"""

messages: list[dict[str, Any]] = []


def init_context() -> None:
    global messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]


def get_context_size(msgs: list[dict[str, Any]]) -> int:
    total = 0
    for message in msgs:
        content = message.get("content")
        if not content:
            continue
        total += len(str(content).split())
    return total


def call_llm() -> Any:
    global log
    api_key = os.environ.get("OPENROUTER_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_KEY environment variable is required")

    while True:
        response = httpx.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "reasoning": reasoning,
                "input": messages,
                "tools": tools,
            },
            timeout=120.0,
        )
        response.raise_for_status()
        output = response.json()

        call = next(
            (item for item in output.get("output", []) if item.get("type") == "function_call"),
            None,
        )

        if call:
            messages.append(call)
            if call.get("name") == "bash":
                args = json.loads(call["arguments"])
                command = args["command"]
                try:
                    result = subprocess.run(
                        ["bash", "-lc", command],
                        cwd=os.getcwd(),
                        capture_output=True,
                        text=True,
                        check=False,
                    )
                    text = result.stdout if result.returncode == 0 else (
                        result.stderr or result.stdout or f"exit {result.returncode}"
                    )
                    messages.append(
                        {
                            "type": "function_call_output",
                            "call_id": call["call_id"],
                            "output": text,
                        }
                    )
                except Exception as error:  # noqa: BLE001
                    print(error, file=sys.stderr)
            continue

        log = output
        return output


def main() -> None:
    global model
    init_context()

    while True:
        try:
            user_input = input(f"({model}) > ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if user_input == "/log":
            print(json.dumps(log, indent=2))
            continue
        if user_input.startswith("/reasoning"):
            new_reasoning = user_input.removeprefix("/reasoning").strip()
            print(f"New reasoning is {new_reasoning}")
            reasoning["effort"] = new_reasoning
            continue
        if user_input.startswith("/model"):
            new_model = user_input.removeprefix("/model").strip()
            print(f"New model is {new_model}")
            model = new_model
            continue
        if user_input == "/context":
            print(f"{get_context_size(messages)} tokens")
            continue
        if user_input == "/clear":
            init_context()
            print("\033[2J\033[H", end="")
            continue
        if user_input == "/bye":
            break

        messages.append({"role": "user", "content": user_input})
        output = call_llm()
        assistant_output = next(
            (
                item
                for item in output.get("output", [])
                if item.get("type") == "message" and item.get("role") == "assistant"
            ),
            None,
        )
        if not assistant_output:
            print("No assistant message in response", file=sys.stderr)
            continue
        answer = next(
            (c for c in assistant_output.get("content", []) if c.get("type") == "output_text"),
            None,
        )
        if not answer:
            print("No text content in assistant message", file=sys.stderr)
            continue
        messages.append({"role": "assistant", "content": answer["text"]})
        print(answer["text"])


if __name__ == "__main__":
    main()

# Agent = Harness (structure) + LLM (brain)
