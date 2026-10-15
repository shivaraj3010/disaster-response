
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(
    os.getenv(
        "DISASTER_DB_PATH",
        str(Path(__file__).resolve().parent / "disaster_response.db"),
    )
)


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(str(DB_PATH), timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def init_db():
    connection = get_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                category TEXT NOT NULL,
                severity TEXT NOT NULL
                    CHECK (severity IN
                        ('low', 'medium', 'high', 'critical')),
                status TEXT NOT NULL DEFAULT 'reported'
                    CHECK (status IN (
                        'reported', 'investigating', 'responding',
                        'resolved', 'closed'
                    )),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        connection.commit()
    finally:
        connection.close()


@contextmanager
def database_session():
    connection = get_connection()

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
