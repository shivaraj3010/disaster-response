
from sync_engine.schemas import SyncEvent
from sync_engine.conflict_resolution import choose_winner


def make_event(event_id, version, timestamp, origin, description):
    return SyncEvent(
        event_id=event_id,
        entity_type="incident",
        entity_id="bridge-001",
        operation="update",
        payload={"description": description},
        origin_node=origin,
        version=version,
        timestamp=timestamp
    )


def main():
    event_a = make_event(
        "event-a", 1, "2026-10-15T10:00:00+00:00",
        "team_a", "Water rising"
    )
    event_b = make_event(
        "event-b", 2, "2026-10-15T09:00:00+00:00",
        "team_b", "Bridge submerged"
    )

    winner = choose_winner(event_a, event_b)

    print("Winner:", winner.event_id)
    print("Description:", winner.payload["description"])
    print("Higher version wins:", winner.event_id == "event-b")


    # Test 2: Same version, different timestamps
    event_c = make_event(
        "event-c", 2, "2026-10-15T11:00:00+00:00",
        "team_a", "Water level rising"
    )

    event_d = make_event(
        "event-d", 2, "2026-10-15T12:00:00+00:00",
        "team_b", "Road completely flooded"
    )

    winner_2 = choose_winner(event_c, event_d)

    print("Same-version winner:", winner_2.event_id)
    print("Later timestamp wins:", winner_2.event_id == "event-d")

if __name__ == "__main__":
    main()
