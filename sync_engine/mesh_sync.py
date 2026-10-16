import sqlite3
import time

from .peer_node import PeerNode
from .conflict_resolution import choose_winner


def sync_peers(
    source: PeerNode,
    destination: PeerNode,
    max_attempts: int = 3,
    retry_delay: float = 0.1
) -> int:
    """
    Copy missing events from source to destination.

    Retry temporary transfer failures up to max_attempts times.
    Return the number of newly copied events.
    """
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")

    if retry_delay < 0:
        raise ValueError("retry_delay cannot be negative")

    copied = 0

    for event in source.get_all_events():
        for attempt in range(max_attempts):
            try:
                if destination.add_event(event):
                    copied += 1
                break

            except (sqlite3.OperationalError, TimeoutError, ConnectionError):
                if attempt == max_attempts - 1:
                    raise

                if retry_delay > 0:
                    time.sleep(retry_delay)

    return copied


def get_entity_winner(peer: PeerNode, entity_type: str, entity_id: str):
    """
    Find the winning event for an entity.

    Higher version wins. If versions match, conflict resolution
    uses timestamp and deterministic tie-breakers.
    Returns None if the entity has no events.
    """
    events = peer.get_entity_events(entity_type, entity_id)

    if not events:
        return None

    winner = events[0]

    for event in events[1:]:
        winner = choose_winner(winner, event)

    return winner


def sync_bidirectional(peer_a: PeerNode, peer_b: PeerNode) -> dict:
    """
    Exchange events between two simulated peers.

    First copy A's events to B, then copy B's events to A.
    """
    a_to_b = sync_peers(peer_a, peer_b)
    b_to_a = sync_peers(peer_b, peer_a)

    return {
        "a_to_b": a_to_b,
        "b_to_a": b_to_a
    }
