
import { useState } from 'react'
import { Search, MapPin, AlertTriangle, ChevronRight, X } from 'lucide-react'
import './Incidents.css'

function Incidents({ incidents = [] }) {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = incidents.filter((incident) => {
    const query = search.toLowerCase()

    const matchesSearch =
      `${incident.id} ${incident.title} ${incident.location}`
        .toLowerCase()
        .includes(query)

    const matchesSeverity =
      severity === 'All' || incident.severity === severity

    const matchesStatus =
      status === 'All' || incident.status === status

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const criticalCount = incidents.filter(
    (item) => item.severity === 'Critical',
  ).length

  const respondingCount = incidents.filter(
    (item) => item.status === 'Responding',
  ).length

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
            Search, filter, and review reported situations.
          </p>
        </div>

        <span className="date-chip">Demo data · Not live reports</span>
      </div>

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
            <p>{filtered.length} matching demo records</p>
          </div>

          <label className="search-box incidents-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, incident, or location..."
              aria-label="Search incidents"
            />
          </label>
        </div>

        <div className="incidents-filters">
          <label>
            Severity
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All</option>
              <option>Reported</option>
              <option>Assigned</option>
              <option>Responding</option>
              <option>In progress</option>
              <option>Monitoring</option>
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
                <th>Reported</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <div className="table-incident">
                      <span
                        className={`incident-icon severity-${incident.severity.toLowerCase()}`}
                      >
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
                      <MapPin size={14} />
                      {incident.location}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`severity-badge badge-${incident.severity.toLowerCase()}`}
                    >
                      {incident.severity}
                    </span>
                  </td>

                  <td>{incident.status}</td>
                  <td>{incident.time || 'Just now'}</td>

                  <td>
                    <button
                      className="icon-button"
                      aria-label={`View ${incident.id}`}
                      onClick={() => setSelected(incident)}
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
          <span>
            Showing {filtered.length} of {incidents.length} sample records
          </span>
          <span className="footer-demo">Local demonstration only</span>
        </div>
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <section
            className="incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="panel-kicker">INCIDENT DETAILS · DEMO</span>
                <h2 id="incident-detail-title">{selected.title}</h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setSelected(null)}
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
              <span
                className={`severity-badge badge-${selected.severity.toLowerCase()}`}
              >
                {selected.severity}
              </span>
            </div>

            <div className="modal-detail-row">
              <span>Status</span>
              <strong>{selected.status}</strong>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
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
