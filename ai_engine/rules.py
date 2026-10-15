"""Rule-based incident classification for PS-016."""

SUPPORTED_TYPES = {
    "flood",
    "fire",
    "earthquake",
    "road_blockage",
    "medical_emergency",
    "other",
}

KEYWORDS = {
    "flood": ["flood", "flooding", "water level rising", "inundation"],
    "fire": ["fire", "burning", "smoke", "flames", "blaze"],
    "earthquake": ["earthquake", "tremor", "seismic"],
    "road_blockage": [
        "road blockage", "road blocked", "blocked road",
        "landslide", "fallen tree", "road closed",
    ],
    "medical_emergency": [
        "medical emergency", "injured", "injury", "unconscious",
        "not breathing", "ambulance", "severe bleeding",
    ],
}


def classify_incident(incident: dict) -> dict:
    """Classify an incident using transparent keyword rules."""

    if not isinstance(incident, dict):
        raise ValueError("Incident must be a dictionary.")

    explicit = incident.get("incident_type")
    if explicit is not None and not isinstance(explicit, str):
        raise ValueError("incident_type must be a string.")

    explicit_type = (
        explicit.strip().lower().replace("-", "_").replace(" ", "_")
        if explicit else ""
    )

    if explicit_type in SUPPORTED_TYPES and explicit_type != "other":
        return {
            "category": explicit_type,
            "confidence": 1.0,
            "method": "explicit_type",
            "evidence": [f"Reported incident type: {explicit_type}"],
            "uncertainty": "Reported type has not been independently verified.",
        }

    parts = []
    for field in ("title", "description"):
        value = incident.get(field, "")
        if value is not None and not isinstance(value, str):
            raise ValueError(f"{field} must be a string.")
        parts.append(value or "")

    text = " ".join(parts).lower()
    matches = {}

    for category, keywords in KEYWORDS.items():
        found = [word for word in keywords if word in text]
        if found:
            matches[category] = found

    if len(matches) == 1:
        category, evidence = next(iter(matches.items()))
        return {
            "category": category,
            "confidence": 0.8,
            "method": "keyword_rules",
            "evidence": evidence,
            "uncertainty": "Keyword-based estimate; verify before taking action.",
        }

    if len(matches) > 1:
        return {
            "category": "other",
            "confidence": 0.3,
            "method": "keyword_rules",
            "evidence": [
                f"{category}: {', '.join(words)}"
                for category, words in matches.items()
            ],
            "uncertainty": "Multiple categories matched; human review is required.",
        }

    return {
        "category": "other",
        "confidence": 0.2,
        "method": "keyword_rules",
        "evidence": [],
        "uncertainty": (
            "Insufficient evidence. Unknown classification does not mean "
            "the incident is safe or minor."
        ),
    }
