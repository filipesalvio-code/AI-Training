from __future__ import annotations


class Logger:
    def info(self, event: str, extra: dict | None = None) -> None:
        print(event if extra is None else f"{event} {extra}")

    def error(self, event: str, extra: dict | None = None) -> None:
        print(event if extra is None else f"{event} {extra}")


logger = Logger()
