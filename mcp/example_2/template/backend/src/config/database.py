from __future__ import annotations

import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


def database_dsn() -> str:
    if url := os.getenv("DATABASE_URL"):
        return url
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "flights")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    return f"postgresql://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{name}"
