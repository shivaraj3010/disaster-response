
from sync_engine.schemas import SyncEvent
from sync_engine.peer_node import PeerNode

import tempfile
from pathlib import Path


def main():
    with tempfile.TemporaryDirectory() as folder:
        db_path = Path(folder) / "peer_a.db"

        peer = PeerNode("rescue_team_a", db_path)

        event = SyncEvent(
            event_id="event-001",
            entity_type="incident",
            entity_id="incident-101",
            operation="create",
            payload={
                "description": "Flood near bridge",
                "severity": "high"
            },
            origin_node="rescue_team_a",
            version=1,
            timestamp="2026-10-15T10:00:00+05:30"
        )

        first_save = peer.add_event(event)
        second_save = peer.add_event(event)
        loaded_event = peer.get_event("event-001")

        print("First save:", first_save)
        print("Duplicate save:", second_save)
        print("Event found:", loaded_event is not None)
        print("Total events:", peer.event_count())

        if loaded_event:
            print("Description:",
                  loaded_event.payload["description"])


if __name__ == "__main__":
    main()
