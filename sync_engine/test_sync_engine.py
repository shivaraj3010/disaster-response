import sqlite3

import pytest

from sync_engine.schemas import SyncEvent
from sync_engine.peer_node import PeerNode
from sync_engine.mesh_sync import (
    sync_peers,
    sync_bidirectional,
    get_entity_winner,
)
from sync_engine.conflict_resolution import choose_winner


@pytest.fixture
def peers(tmp_path):
    """Create two temporary peer databases."""
    peer_a = PeerNode(
        "team-a",
        tmp_path / "peer_a.db",
    )
    peer_b = PeerNode(
        "team-b",
        tmp_path / "peer_b.db",
    )
    return peer_a, peer_b


def make_event(
    event_id,
    entity_type="incident",
    entity_id="bridge-001",
    version=1,
    timestamp="2026-10-15T10:00:00+00:00",
    origin_node="team-a",
    description="Flood near bridge",
):
    """Create a valid sample event."""
    return SyncEvent(
        event_id=event_id,
        entity_type=entity_type,
        entity_id=entity_id,
        operation="create",
        payload={"description": description},
        origin_node=origin_node,
        version=version,
        timestamp=timestamp,
    )


def test_save_event(peers):
    peer_a, _ = peers
    event = make_event("event-001")

    assert peer_a.add_event(event) is True
    assert peer_a.has_event("event-001")


def test_duplicate_event_is_not_saved_twice(peers):
    peer_a, _ = peers
    event = make_event("event-001")

    assert peer_a.add_event(event) is True
    assert peer_a.add_event(event) is False
    assert peer_a.event_count() == 1


def test_get_entity_events(peers):
    peer_a, _ = peers

    peer_a.add_event(make_event("event-001"))
    peer_a.add_event(
        make_event(
            "event-002",
            entity_id="hospital-001",
        )
    )

    events = peer_a.get_entity_events(
        "incident",
        "bridge-001",
    )

    assert len(events) == 1
    assert events[0].event_id == "event-001"


def test_bidirectional_sync(peers):
    peer_a, peer_b = peers

    peer_a.add_event(make_event("event-001"))
    peer_b.add_event(
        make_event(
            "event-002",
            origin_node="team-b",
        )
    )

    result = sync_bidirectional(peer_a, peer_b)

    assert result == {
        "a_to_b": 1,
        "b_to_a": 1,
    }
    assert peer_a.event_count() == 2
    assert peer_b.event_count() == 2


def test_second_sync_does_not_copy_duplicates(peers):
    peer_a, peer_b = peers
    peer_a.add_event(make_event("event-001"))

    first_result = sync_peers(peer_a, peer_b)
    second_result = sync_peers(peer_a, peer_b)

    assert first_result == 1
    assert second_result == 0
    assert peer_b.event_count() == 1


def test_higher_version_wins():
    older = make_event(
        "event-001",
        version=1,
        description="Water near bridge",
    )
    newer = make_event(
        "event-002",
        version=2,
        origin_node="team-b",
        description="Bridge submerged",
    )

    winner = choose_winner(older, newer)

    assert winner.event_id == "event-002"
    assert winner.version == 2


def test_later_timestamp_breaks_version_tie():
    earlier = make_event(
        "event-001",
        version=1,
        timestamp="2026-10-15T10:00:00+00:00",
    )
    later = make_event(
        "event-002",
        version=1,
        timestamp="2026-10-15T11:00:00+00:00",
    )

    winner = choose_winner(earlier, later)

    assert winner.event_id == "event-002"


def test_both_peers_choose_same_winner(peers):
    peer_a, peer_b = peers

    peer_a.add_event(
        make_event(
            "event-001",
            version=1,
            origin_node="team-a",
            description="Flood reported",
        )
    )
    peer_b.add_event(
        make_event(
            "event-002",
            version=2,
            origin_node="team-b",
            description="Bridge completely flooded",
        )
    )

    sync_bidirectional(peer_a, peer_b)

    winner_a = get_entity_winner(
        peer_a,
        "incident",
        "bridge-001",
    )
    winner_b = get_entity_winner(
        peer_b,
        "incident",
        "bridge-001",
    )

    assert winner_a is not None
    assert winner_b is not None
    assert winner_a.event_id == winner_b.event_id
    assert winner_a.event_id == "event-002"


def test_sync_recovers_from_temporary_failure(peers, monkeypatch):
    peer_a, peer_b = peers
    peer_a.add_event(make_event("event-retry"))

    original_add_event = peer_b.add_event
    attempts = {"count": 0}

    def fail_once_then_save(event):
        attempts["count"] += 1

        if attempts["count"] == 1:
            raise sqlite3.OperationalError(
                "Simulated temporary failure"
            )

        return original_add_event(event)

    monkeypatch.setattr(
        peer_b,
        "add_event",
        fail_once_then_save,
    )

    copied = sync_peers(peer_a, peer_b)

    assert copied == 1
    assert peer_b.has_event("event-retry")
    assert attempts["count"] == 2

def test_equivalent_timezones_use_deterministic_tie_breaker():
    event_a = make_event(
        "event-a",
        version=1,
        timestamp="2026-10-15T11:00:00+01:00",
        origin_node="team-a",
    )

    event_b = make_event(
        "event-b",
        version=1,
        timestamp="2026-10-15T10:00:00+00:00",
        origin_node="team-b",
    )

    winner = choose_winner(event_a, event_b)

    # Both timestamps represent the same instant.
    # The origin_node tie-breaker selects team-b.
    assert winner.event_id == "event-b"

def test_sync_raises_after_all_retries_fail(peers, monkeypatch):
    peer_a, peer_b = peers
    peer_a.add_event(make_event("event-fail"))

    attempts = {"count": 0}

    def always_fail(event):
        attempts["count"] += 1
        raise sqlite3.OperationalError("Simulated persistent failure")

    monkeypatch.setattr(peer_b, "add_event", always_fail)

    with pytest.raises(sqlite3.OperationalError):
        sync_peers(peer_a, peer_b, max_attempts=3, retry_delay=0)

    assert attempts["count"] == 3
    assert not peer_b.has_event("event-fail")

def test_offline_events_sync_when_peers_reconnect(peers):
    peer_a, peer_b = peers

    # Both peers create events while disconnected.
    peer_a.add_event(
        make_event("offline-a", origin_node="team-a")
    )
    peer_b.add_event(
        make_event("offline-b", origin_node="team-b")
    )

    # Simulate reconnection by synchronizing the peers.
    result = sync_bidirectional(peer_a, peer_b)

    assert result == {"a_to_b": 1, "b_to_a": 1}
    assert peer_a.has_event("offline-b")
    assert peer_b.has_event("offline-a")
    assert peer_a.event_count() == 2
    assert peer_b.event_count() == 2
