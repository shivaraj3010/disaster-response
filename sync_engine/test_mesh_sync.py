
import tempfile
from pathlib import Path

from sync_engine.peer_node import PeerNode
from sync_engine.schemas import SyncEvent
from sync_engine.mesh_sync import (
    sync_bidirectional,
    get_entity_winner
)


def main():
    with tempfile.TemporaryDirectory() as folder:
        root = Path(folder)

        peer_a = PeerNode("team_a", root / "team_a.db")
        peer_b = PeerNode("team_b", root / "team_b.db")

        # Team A reports the incident.
        event_a = SyncEvent(
            event_id="flood-001",
            entity_type="incident",
            entity_id="bridge-001",
            operation="create",
            payload={"description": "Flood near bridge"},
            origin_node="team_a",
            version=1,
            timestamp="2026-10-15T10:00:00+05:30"
        )

        # Team B independently records a newer version
        # of the same incident.
        event_b = SyncEvent(
            event_id="flood-002",
            entity_type="incident",
            entity_id="bridge-001",
            operation="update",
            payload={"description": "Bridge completely flooded"},
            origin_node="team_b",
            version=2,
            timestamp="2026-10-15T10:05:00+05:30"
        )

        peer_a.add_event(event_a)
        peer_b.add_event(event_b)

        print("Before sync - Team A:", peer_a.event_count())
        print("Before sync - Team B:", peer_b.event_count())

        # Exchange events between the peers.
        result = sync_bidirectional(peer_a, peer_b)
        print("Sync result:", result)

        print("After sync - Team A:", peer_a.event_count())
        print("After sync - Team B:", peer_b.event_count())

        # Find the winning event on both peers.
        winner_a = get_entity_winner(
            peer_a, "incident", "bridge-001"
        )
        winner_b = get_entity_winner(
            peer_b, "incident", "bridge-001"
        )

        print("Team A winner:", winner_a.event_id)
        print("Team B winner:", winner_b.event_id)
        print("Same winner:", winner_a.event_id == winner_b.event_id)
        print("Higher version wins:", winner_a.event_id == "flood-002")
        print(
            "Winning description:",
            winner_a.payload["description"]
        )

        # Repeat synchronization to check duplicate prevention.
        result2 = sync_bidirectional(peer_a, peer_b)
        print("Second sync:", result2)
        print("Final Team A count:", peer_a.event_count())
        print("Final Team B count:", peer_b.event_count())


if __name__ == "__main__":
    main()
