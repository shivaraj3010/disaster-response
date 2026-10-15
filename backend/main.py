
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi import status
import sqlite3

from database import database_session, init_db
from schemas import IncidentCreate, IncidentUpdate, IncidentResponse


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def get_db():
    with database_session() as connection:
        yield connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PS-016 Disaster Response API",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "disaster-response-api"}


@app.post(
    "/api/incidents",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident(
    incident: IncidentCreate,
    db: sqlite3.Connection = Depends(get_db),
):
    now = utc_now()
    incident_id = str(uuid4())

    db.execute(
        """
        INSERT INTO incidents
        (id, description, location, category, severity, status,
         created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            incident_id,
            incident.description,
            incident.location,
            incident.category,
            incident.severity,
            "reported",
            now,
            now,
        ),
    )

    row = db.execute(
        "SELECT * FROM incidents WHERE id = ?", (incident_id,)
    ).fetchone()

    return dict(row)


@app.get("/api/incidents", response_model=list[IncidentResponse])
def list_incidents(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        "SELECT * FROM incidents ORDER BY created_at DESC"
    ).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: str,
    db: sqlite3.Connection = Depends(get_db),
):
    row = db.execute(
        "SELECT * FROM incidents WHERE id = ?", (incident_id,)
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return dict(row)


@app.patch("/api/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: str,
    updates: IncidentUpdate,
    db: sqlite3.Connection = Depends(get_db),
):
    changes = updates.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one field to update",
        )

    if any(value is None for value in changes.values()):
        raise HTTPException(
            status_code=422,
            detail="Updated fields cannot be null",
        )

    existing = db.execute(
        "SELECT * FROM incidents WHERE id = ?", (incident_id,)
    ).fetchone()

    if existing is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    changes["updated_at"] = utc_now()
    columns = list(changes.keys())
    assignments = ", ".join(f"{column} = ?" for column in columns)
    values = [changes[column] for column in columns]

    db.execute(
        f"UPDATE incidents SET {assignments} WHERE id = ?",
        (*values, incident_id),
    )

    row = db.execute(
        "SELECT * FROM incidents WHERE id = ?", (incident_id,)
    ).fetchone()

    return dict(row)


@app.delete("/api/incidents/{incident_id}", status_code=204)
def delete_incident(
    incident_id: str,
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.execute(
        "DELETE FROM incidents WHERE id = ?", (incident_id,)
    )

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Incident not found")

    return Response(status_code=204)
