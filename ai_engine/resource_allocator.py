
"""Incident ranking and resource allocation for PS-016."""

SEVERITY_RANK = {
    "Critical": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1,
}


def rank_incidents(incidents: list[dict]) -> list[dict]:
    """Rank incidents by severity, preserving ties' input order."""

    if not isinstance(incidents, list):
        raise ValueError("incidents must be a list.")

    for incident in incidents:
        if not isinstance(incident, dict):
            raise ValueError("Each incident must be a dictionary.")

        severity = incident.get("severity")

        if not isinstance(severity, str) or severity not in SEVERITY_RANK:
            raise ValueError(
                "Each incident must have a valid severity: "
                "Critical, High, Medium, or Low."
            )

    return sorted(
        incidents,
        key=lambda incident: SEVERITY_RANK[incident["severity"]],
        reverse=True,
    )


def allocate_resources(
    incidents: list[dict],
    inventory: dict[str, int],
) -> dict:
    """Allocate limited resources in incident priority order.

    Each requested resource is treated as one unit.
    This produces recommendations, not actual dispatch orders.
    """

    if not isinstance(incidents, list):
        raise ValueError("incidents must be a list.")

    if not isinstance(inventory, dict):
        raise ValueError("inventory must be a dictionary.")

    for resource, quantity in inventory.items():
        if not isinstance(resource, str) or not resource.strip():
            raise ValueError("Resource names must be non-empty strings.")

        if type(quantity) is not int or quantity < 0:
            raise ValueError(
                "Inventory quantities must be non-negative integers."
            )

    for incident in incidents:
        if not isinstance(incident, dict):
            raise ValueError("Each incident must be a dictionary.")

        incident_id = incident.get("incident_id")
        if not isinstance(incident_id, str) or not incident_id.strip():
            raise ValueError("Each incident needs a non-empty incident_id.")

        needs = incident.get("resource_needs")
        if not isinstance(needs, list):
            raise ValueError("resource_needs must be a list.")

        if any(
            not isinstance(resource, str) or not resource.strip()
            for resource in needs
        ):
            raise ValueError("Requested resource names must be non-empty strings.")

        if len(needs) != len(set(needs)):
            raise ValueError("Duplicate resource requests are not supported.")

    incident_ids = [incident["incident_id"] for incident in incidents]
    if len(incident_ids) != len(set(incident_ids)):
        raise ValueError("Incident IDs must be unique.")

    available = inventory.copy()
    allocations = {}
    unallocated = {}

    for incident in rank_incidents(incidents):
        incident_id = incident["incident_id"]
        allocations[incident_id] = []
        unallocated[incident_id] = []

        for resource in incident["resource_needs"]:
            if available.get(resource, 0) > 0:
                allocations[incident_id].append(resource)
                available[resource] -= 1
            else:
                unallocated[incident_id].append(resource)

    return {
        "allocations": allocations,
        "unallocated": unallocated,
        "remaining_inventory": available,
        "needs_human_review": True,
    }
