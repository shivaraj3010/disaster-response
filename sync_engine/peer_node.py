
import sqlite3
import json
from pathlib import Path
from dataclasses import asdict
from contextlib import contextmanager

from .schemas import SyncEvent


class PeerNode:
    def __init__(self, node_id, db_path):
        self.node_id = node_id
        self.db_path = str(db_path)

        Path(self.db_path).parent.mkdir(
            parents=True, exist_ok=True
        )
        self._initialize_database()

    @contextmanager
    def _connect(self):
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row

        try:
            connection.execute("PRAGMA busy_timeout = 5000")
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def _initialize_database(self):
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id TEXT PRIMARY KEY,
                    entity_type TEXT NOT NULL,
                    entity_id TEXT NOT NULL,
                    operation TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    origin_node TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)

    def add_event(self, event):
        """Save an event, ignoring duplicate event IDs."""
        if not isinstance(event, SyncEvent):
            raise TypeError("event must be a SyncEvent")

        data = asdict(event)

        with self._connect() as conn:
            cursor = conn.execute("""
                INSERT OR IGNORE INTO events (
                    event_id, entity_type, entity_id,
                    operation, payload, origin_node,
                    version, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data["event_id"],
                data["entity_type"],
                data["entity_id"],
                data["operation"],
                json.dumps(data["payload"]),
                data["origin_node"],
                data["version"],
                data["timestamp"]
            ))

            return cursor.rowcount == 1

    def get_event(self, event_id):
        """Return one event by its ID."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM events WHERE event_id = ?",
                (event_id,)
            ).fetchone()

        if row is None:
            return None

        data = dict(row)
        data["payload"] = json.loads(data["payload"])
        return SyncEvent(**data)

    def get_all_events(self):
        """Return all events stored on this peer."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM events ORDER BY timestamp, event_id"
            ).fetchall()

        events = []
        for row in rows:
            data = dict(row)
            data["payload"] = json.loads(data["payload"])
            events.append(SyncEvent(**data))

        return events

    def get_entity_events(self, entity_type, entity_id):
        """Return all events belonging to one entity."""
        with self._connect() as conn:
            rows = conn.execute("""
                SELECT * FROM events
                WHERE entity_type = ? AND entity_id = ?
                ORDER BY timestamp, event_id
            """, (entity_type, entity_id)).fetchall()

        events = []
        for row in rows:
            data = dict(row)
            data["payload"] = json.loads(data["payload"])
            events.append(SyncEvent(**data))

        return events

    def has_event(self, event_id):
        """Check whether an event ID already exists."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM events WHERE event_id = ?",
                (event_id,)
            ).fetchone()

        return row is not None

    def event_count(self):
        """Return the number of stored events."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) FROM events"
            ).fetchone()

        return row[0]
