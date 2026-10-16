
"""Rule-based severity and priority assessment for PS-016."""

SEVERITIES = ("Critical", "High", "Medium", "Low")

PRIORITY_BY_SEVERITY = {
    "Critical": "P1",
    "High": "P2",
    "Medium": "P3",
    "Low": "P4",
}

CRITICAL_KEYWORDS = (
    "not breathing",
    "unconscious",
    "severe bleeding",
    "people trapped",
    "multiple people injured",
    "building collapsed",
    "spreading fire",
    "rapidly rising water",
)

HIGH_KEYWORDS = (
    "injured",
    "injury",
    "fire",
    "flames",
    "earthquake",
    "landslide",
    "flood",
    "trapped",
    "evacuate",
)


def assess_severity(incident: dict, category: str) -> dict:
    """Assess severity using transparent rules and return an explanation."""

    if not isinstance(incident, dict):
        raise ValueError("Incident must be a dictionary.")

    if not isinstance(category, str) or not category.strip():
        raise ValueError("category must be a non-empty string.")

    title = incident.get("title", "") or ""
    description = incident.get("description", "") or ""

    if not isinstance(title, str):
        raise ValueError("title must be a string.")

    if not isinstance(description, str):
        raise ValueError("description must be a string.")

    text = f"{title} {description}".lower()

    # Preserve a valid severity explicitly reported by a responder.
    supplied = incident.get("severity")
    if supplied is not None:
        if not isinstance(supplied, str):
            raise ValueError("severity must be a string.")

        normalized = supplied.strip().capitalize()
        if normalized not in SEVERITIES:
            raise ValueError(
                f"severity must be one of: {', '.join(SEVERITIES)}"
            )

        return {
            "severity": normalized,
            "priority": PRIORITY_BY_SEVERITY[normalized],
            "reason": (
                f"Preserved the explicitly reported severity: {normalized}."
            ),
            "evidence": ["Explicitly reported severity"],
            "needs_human_review": True,
        }

    critical_matches = [
        keyword for keyword in CRITICAL_KEYWORDS if keyword in text
    ]

    if critical_matches:
        severity = "Critical"
        evidence = critical_matches
        reason = (
            "Critical-risk indicators found: "
            + ", ".join(evidence)
            + ". Prompt assessment by trained responders is required."
        )

    else:
        high_matches = [
            keyword for keyword in HIGH_KEYWORDS if keyword in text
        ]

        if high_matches:
            severity = "High"
            evidence = high_matches
            reason = (
                "High-risk indicators found: "
                + ", ".join(evidence)
                + ". Prioritize prompt responder review."
            )

        elif category in {
            "fire",
            "flood",
            "earthquake",
            "medical_emergency",
        }:
            severity = "High"
            evidence = [f"Incident category: {category}"]
            reason = (
                f"Category '{category}' receives a conservative "
                "initial High assessment."
            )

        elif category == "road_blockage":
            severity = "Medium"
            evidence = ["Incident category: road_blockage"]
            reason = (
                "A road blockage is reported, but the description "
                "does not establish a critical hazard."
            )

        else:
            severity = "Medium"
            evidence = []
            reason = (
                "Insufficient information for a more precise assessment. "
                "Medium is provisional and does not mean the incident "
                "is safe or minor."
            )

    return {
        "severity": severity,
        "priority": PRIORITY_BY_SEVERITY[severity],
        "reason": reason,
        "evidence": evidence,
        "needs_human_review": True,
    }
