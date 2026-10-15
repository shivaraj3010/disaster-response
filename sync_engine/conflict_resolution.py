
from datetime import datetime, timezone

from .schemas import SyncEvent


def normalize_timestamp(timestamp: str) -> datetime:
    """Convert a timezone-aware timestamp to UTC."""
    parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

    if parsed.tzinfo is None:
        raise ValueError("Timestamp must include a timezone")

    return parsed.astimezone(timezone.utc)


def choose_winner(event_a: SyncEvent, event_b: SyncEvent) -> SyncEvent:
    """
    Choose a deterministic winner between two versions
    of the same entity.

    Priority:
    1. Higher version
    2. Later timestamp
    3. Origin node name
    4. Event ID
    """
    if event_a.entity_id != event_b.entity_id:
        raise ValueError("Events must refer to the same entity")

    if event_a.entity_type != event_b.entity_type:
        raise ValueError("Events must have the same entity type")

    key_a = (
        event_a.version,
        normalize_timestamp(event_a.timestamp),
        event_a.origin_node,
        event_a.event_id,
    )

    key_b = (
        event_b.version,
        normalize_timestamp(event_b.timestamp),
        event_b.origin_node,
        event_b.event_id,
    )

    return event_a if key_a >= key_b else event_b
