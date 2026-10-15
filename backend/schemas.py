
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


Severity = Literal["low", "medium", "high", "critical"]

IncidentStatus = Literal[
    "reported",
    "investigating",
    "responding",
    "resolved",
    "closed",
]


class IncidentCreate(BaseModel):
    description: str = Field(min_length=1, max_length=5000)
    location: str = Field(min_length=1, max_length=300)
    category: str = Field(min_length=1, max_length=100)
    severity: Severity

    @field_validator("description", "location", "category")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be blank")
        return value


class IncidentUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    location: str | None = Field(default=None, min_length=1, max_length=300)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    severity: Severity | None = None
    status: IncidentStatus | None = None

    @field_validator("description", "location", "category")
    @classmethod
    def reject_blank_text(cls, value):
        if value is not None and not value.strip():
            raise ValueError("Field cannot be blank")
        return value.strip() if value is not None else value


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    description: str
    location: str
    category: str
    severity: Severity
    status: IncidentStatus
    created_at: datetime
    updated_at: datetime
