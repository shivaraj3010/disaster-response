
from dataclasses import dataclass
from datetime import datetime
import json

ENTITY_TYPES = {
    "incident",
    "rescue_task",
    "inventory_item"
}

OPERATIONS = {
    "create",
    "update",
    "delete"
}


@dataclass
class SyncEvent:
    event_id: str
    entity_type: str
    entity_id: str
    operation: str
    payload: dict
    origin_node: str
    version: int
    timestamp: str

    def __post_init__(self):
        if self.entity_type not in ENTITY_TYPES:
            raise ValueError("Invalid entity type")

        if self.operation not in OPERATIONS:
            raise ValueError("Invalid operation")

        if not isinstance(self.payload, dict):
            raise ValueError("Payload must be a dictionary")

        if self.version < 1:
            raise ValueError("Version must be positive")

        try:
            json.dumps(self.payload)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                "Payload must be JSON serializable"
            ) from exc

        try:
            parsed_time = datetime.fromisoformat(
                self.timestamp.replace("Z", "+00:00")
            )
            if parsed_time.tzinfo is None:
                raise ValueError(
                    "Timestamp needs a timezone"
                )
        except ValueError as exc:
            raise ValueError(
                "Timestamp must be ISO-8601 with timezone"
            ) from exc
