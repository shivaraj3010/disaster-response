
import { useState } from 'react'
import {
  Search,
  MapPin,
  AlertTriangle,
  ChevronRight,
  X,
  UserRound,
  UserCheck,
} from 'lucide-react'
import { useDisasterState } from '../DisasterStateContext'
import './Incidents.css'

const workers = [
  'Arun Kumar',
  'Rahul Das',
  'Priya Sharma',
  'Meena Raj',
]

function Incidents({ incidents = [] }) {
  const { setIncidents } = useDisasterState()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All')
  const [status, setStatus] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const selected = incidents.find((item) => item.id === selectedId)

  const filtered = incidents.filter((incident) => {
    const query = search.toLowerCase()
    const matchesSearch =
      `${incident.id} ${incident.title} ${incident.location} ${incident.assignedResponder || ''}`
        .toLowerCase()
        .includes(query)

    return (
      matchesSearch &&
      (severity === 'All' || incident.severity === severity) &&
      (status === 'All' || incident.status === status)
    )
  })

  const criticalCount = incidents.filter(
    (item) => item.severity === 'Critical'
  ).length

  const respondingCount = incidents.filter(
    (item) => ['Responding', 'In progress', 'In Progress'].includes(item.status)
  ).length

  function assignWorker(worker) {
    if (!selected) return

    setIncidents((current) =>
      current.map((incident) =>
        incident.id === selected.id
          ? {
              ...incident,
              assignedResponder: worker,
              status:
                incident.status === 'Reported'
                  ? 'Assigned'
                  : incident.status,
            }
          : incident
      )
    )

    setFeedback(`${worker} assigned to ${selected.id}.`)
  }

  return (
    <section className="incidents-page">
      <div className="incidents-page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            INCIDENT MANAGEMENT
          </div>
          <h1>Incidents</h1>
          <p className="page-subtitle">
            Review incidents and assign response workers.
          </p>
        </div>
        <span className="date-chip">Demo data · Not live reports</span>
      </div>

      {feedback && (
        <p role="status" className="incident-assignment-feedback">
          <UserCheck size={16} /> {feedback}
        </p>
      )}

      <div className="incident-stats">
        <article className="panel incident-stat">
          <span>Total incidents</span>
          <strong>{incidents.length}</strong>
        </article>
        <article className="panel incident-stat">
          <span>Critical</span>
          <strong>{criticalCount}</strong>
        </article>
        <article className="panel incident-stat">
          <span>Responding</span>
          <strong>{respondingCount}</strong>
        </article>
      </div>

      <div className="panel incidents-table-panel">
        <div className="incidents-toolbar">
          <div>
            <h2>All reported incidents</h2>
            <p>{filtered.length} matching records</p>
          </div>

          <label className="search-box incidents-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, incident, location, worker..."
              aria-label="Search incidents"
            />
          </label>
        </div>

        <div className="incidents-filters">
          <label>
            Severity
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option>Reported</option>
              <option>Assigned</option>
              <option>Responding</option>
              <option>In progress</option>
              <option>In Progress</option>
              <option>Monitoring</option>
              <option>Waiting for Review</option>
              <option>Resolved</option>
            </select>
          </label>

          <button
            className="secondary-button"
            onClick={() => {
              setSearch('')
              setSeverity('All')
              setStatus('All')
            }}
          >
            Clear filters
          </button>
        </div>

        <div className="incidents-table-wrap">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned worker</th>
                <th>Reported</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <div className="table-incident">
                      <span className={`incident-icon severity-${(incident.severity || 'low').toLowerCase()}`}>
                        <AlertTriangle size={17} />
                      </span>
                      <div>
                        <strong>{incident.title}</strong>
                        <span>{incident.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="table-location">
                      <MapPin size={14} /> {incident.location}
                    </span>
                  </td>
                  <td>
                    <span className={`severity-badge badge-${(incident.severity || 'low').toLowerCase()}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td>{incident.status}</td>
                  <td>{incident.assignedResponder || 'Unassigned'}</td>
                  <td>{incident.time || 'Just now'}</td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`View ${incident.id}`}
                      onClick={() => {
                        setSelectedId(incident.id)
                        setFeedback('')
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              No incidents match these filters. Try clearing them.
            </div>
          )}
        </div>

        <div className="panel-footer">
          <span>Showing {filtered.length} of {incidents.length} records</span>
          <span className="footer-demo">Local demonstration only</span>
        </div>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelectedId(null)}>
          <section
            className="incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="panel-kicker">INCIDENT DETAILS</span>
                <h2 id="incident-detail-title">{selected.title}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedId(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-detail-row">
              <span>Incident ID</span>
              <strong>{selected.id}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Location</span>
              <strong>{selected.location}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Severity</span>
              <strong>{selected.severity}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Status</span>
              <strong>{selected.status}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Assigned worker</span>
              <strong>{selected.assignedResponder || 'Unassigned'}</strong>
            </div>

            <div className="incident-worker-assignment">
              <label htmlFor="incident-worker">
                <UserRound size={16} /> Assign worker
              </label>
              <select
                id="incident-worker"
                value={selected.assignedResponder || ''}
                onChange={(e) => assignWorker(e.target.value)}
              >
                <option value="" disabled>Select a worker</option>
                {workers.map((worker) => (
                  <option key={worker} value={worker}>{worker}</option>
                ))}
              </select>
              <p>Demo assignment only; no real-world dispatch occurs.</p>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setSelectedId(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default Incidents
