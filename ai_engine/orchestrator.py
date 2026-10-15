
"""Offline incident orchestration for the PS-016 AI engine."""

from typing import Any

from .ai_agents import assess_severity
from .rules import classify_incident
from .schemas import IncidentAssessment, IncidentReport


def orchestrate_incident(incident_data: dict[str, Any]) -> dict[str, Any]:
    """Classify an incident, assess its risk, and return one assessment."""

    # Step 1: Validate and normalize the incoming report.
    incident = IncidentReport.from_dict(incident_data)
    normalized = incident.to_dict()

    # Step 2: Classify the incident using local keyword rules.
    classification = classify_incident(normalized)
    category = classification["category"]

    # Step 3: Assess severity and priority using local rules.
    severity_result = assess_severity(normalized, category)

    # Step 4: Generate conservative action recommendations.
    recommended_actions = _recommend_actions(
        category,
        severity_result["severity"],
    )

    # Step 5: Suggest potentially useful resources.
    # These are suggestions, not confirmation of availability.
    resource_needs = _suggest_resources(category)

    # Step 6: Combine evidence and remove duplicates while
    # preserving its original order.
    combined_evidence = list(
        dict.fromkeys(
            classification["evidence"] + severity_result["evidence"]
        )
    )

    # Step 7: Build the structured assessment.
    assessment = IncidentAssessment(
        incident_id=incident.incident_id,
        category=category,
        confidence=classification["confidence"],
        severity=severity_result["severity"],
        priority=severity_result["priority"],
        recommended_actions=recommended_actions,
        resource_needs=resource_needs,
        reason=severity_result["reason"],
        evidence=combined_evidence,
        needs_human_review=True,
        classification_method=classification["method"],
        uncertainty=classification["uncertainty"],
    )

    return assessment.to_dict()


def _recommend_actions(category: str, severity: str) -> list[str]:
    """Return conservative action suggestions for responders."""

    actions = [
        "Verify the report with a trained responder.",
        "Record the incident location and time if available.",
    ]

    if severity == "Critical":
        actions.insert(
            0,
            "Immediately alert the responsible emergency response team.",
        )
    elif severity == "High":
        actions.insert(
            0,
            "Prioritize prompt assessment by the response team.",
        )

    category_actions = {
        "flood": (
            "Check rising water levels and identify safe evacuation routes."
        ),
        "fire": (
            "Keep people away from the fire and alert the fire service."
        ),
        "earthquake": (
            "Check for structural damage and secondary hazards."
        ),
        "road_blockage": (
            "Mark the blocked route and identify a safe alternative."
        ),
        "medical_emergency": (
            "Request qualified medical assistance."
        ),
        "other": (
            "Gather more details to determine the appropriate response."
        ),
    }

    actions.append(
        category_actions.get(category, category_actions["other"])
    )

    return actions


def _suggest_resources(category: str) -> list[str]:
    """Suggest potentially relevant resources without claiming availability."""

    resources = {
        "flood": [
            "Rescue personnel",
            "Life jackets",
            "Rescue boat if needed",
        ],
        "fire": [
            "Fire and rescue personnel",
            "Firefighting equipment",
        ],
        "earthquake": [
            "Search-and-rescue personnel",
            "First-aid supplies",
        ],
        "road_blockage": [
            "Road clearance team",
            "Traffic control equipment",
        ],
        "medical_emergency": [
            "Qualified medical personnel",
            "First-aid kit",
        ],
        "other": [
            "Assessment team",
            "Communication equipment",
        ],
    }

    return list(resources.get(category, resources["other"]))
