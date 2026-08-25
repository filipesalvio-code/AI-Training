# mcp/example_1

Random number MCP servers in Python using the official [`mcp`](https://pypi.org/project/mcp/) SDK.

## Prerequisites

```bash
pip install "mcp[cli]"
```

## Stdio transport

```bash
/opt/homebrew/bin/python3.11 random_number_stdio.py
```

## Streamable HTTP transport

Listens on `http://0.0.0.0:3000/mcp`:

```bash
/opt/homebrew/bin/python3.11 random_number_http.py
```

## Tools

- `get_random_number` — random integer in `[0, 100000)`
- `get_random_number_limit` — random integer in `[0, limit)` (default limit `100`)
