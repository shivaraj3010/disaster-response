
"""Data schemas for the PS-016 disaster-response AI engine."""

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class IncidentReport:
    """Normalized input received from a disaster-response team."""

    incident_id: str = ""
    title: str = ""
    description: str = ""
    incident_type: str | None = None
    severity: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "IncidentReport":
        """Validate and convert a dictionary into an incident report."""

        if not isinstance(data, dict):
            raise ValueError("Incident report must be a dictionary.")

        incident_id = data.get("incident_id", "")
        title = data.get("title", "")
        description = data.get("description", "")
        incident_type = data.get("incident_type")
        severity = data.get("severity")

        if not isinstance(incident_id, str):
            raise ValueError("incident_id must be a string.")

        if not isinstance(title, str):
            raise ValueError("title must be a string.")

        if not isinstance(description, str):
            raise ValueError("description must be a string.")

        if incident_type is not None and not isinstance(incident_type, str):
            raise ValueError("incident_type must be a string or None.")

        if severity is not None and not isinstance(severity, str):
            raise ValueError("severity must be a string or None.")

        return cls(
            incident_id=incident_id,
            title=title,
            description=description,
            incident_type=incident_type,
            severity=severity,
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert the incident report into a dictionary."""

        return asdict(self)


@dataclass
class IncidentAssessment:
    """Structured result produced by the AI engine."""

    incident_id: str = ""
    category: str = "other"
    confidence: float = 0.0
    severity: str = "Medium"
    priority: str = "P3"
    recommended_actions: list[str] = field(default_factory=list)
    resource_needs: list[str] = field(default_factory=list)
    reason: str = ""
    evidence: list[str] = field(default_factory=list)
    needs_human_review: bool = True
    classification_method: str = "unknown"
    uncertainty: str = "Assessment requires human verification."

    def to_dict(self) -> dict[str, Any]:
        """Convert the assessment into a dictionary."""

        return asdict(self)
