
import { useState } from 'react'
import {
  Activity, AlertTriangle, Bell, CheckCircle2, ChevronDown, Clock3,
  Cloud, CloudOff, Command, LayoutDashboard, MapPin, Menu, Package,
  Radio, Search, ShieldCheck, Sparkles, Users, X, ArrowUpRight,
  ClipboardList, RefreshCw,
} from 'lucide-react'
import '../App.css'
import Incidents from './Incidents'
import RescueTasks from './RescueTasks'
import Inventory from './Inventory'
import AIRecommendations from './AIRecommendations'
import SyncStatus from './SyncStatus'

const initialActivities = [
  { text: 'Rescue team assigned to INC-0241', time: '2 min ago', type: 'team' },
  { text: 'New incident report received', time: '8 min ago', type: 'alert' },
  { text: 'Medical supplies marked available', time: '14 min ago', type: 'resource' },
]

const demoResponders = [
  { id: 'RES-001', name: 'Arun Kumar', role: 'Rescue Team Lead', skills: 'Flood rescue', availability: 'Available' },
  { id: 'RES-002', name: 'Priya Sharma', role: 'Medical Officer', skills: 'Medical assistance', availability: 'Available' },
  { id: 'RES-003', name: 'Rahul Das', role: 'Field Responder', skills: 'Search and rescue', availability: 'Available' },
  { id: 'RES-004', name: 'Meena Raj', role: 'Supply Coordinator', skills: 'Emergency supplies', availability: 'Available' },
]

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Incidents', icon: AlertTriangle },
  { label: 'Rescue Tasks', icon: ClipboardList },
  { label: 'Inventory', icon: Package },
  { label: 'AI Recommendations', icon: Sparkles },
  { label: 'Sync Status', icon: RefreshCw },
]


 // Closed, verified, and resolved incidents are hidden from the active Dashboard.
const isIncidentClosed = (incident) =>
  ['closed', 'verified', 'resolved'].includes(
    String(incident.status || '').trim().toLowerCase(),
  )


function Dashboard({ activePage, onNavigate, incidents = [], setIncidents }) {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [selectedResponderId, setSelectedResponderId] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [activities, setActivities] = useState(initialActivities)
  const [lastAction, setLastAction] = useState('')

  // Keep every incident in shared state, but display only active incidents
  // in the Dashboard's incident overview.
  const activeIncidents = incidents.filter(
    (incident) => !isIncidentClosed(incident),
  )

  const filteredIncidents = activeIncidents.filter((incident) => {
    const matchesSearch =
      `${incident.title} ${incident.id} ${incident.location}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesSeverity =
      severityFilter === 'All' || incident.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  const criticalCount = activeIncidents.filter(
    (incident) => incident.severity === 'Critical',
  ).length

  function addActivity(text, type = 'alert') {
    setActivities((previous) =>
      [{ text, time: 'Just now', type }, ...previous].slice(0, 4),
    )
  }

  function handleNavigation(label) {
    onNavigate(label)
    setSidebarOpen(false)
    setLastAction('')
    setSearch('')
  }

  function openIncident(incident) {
    setSelectedIncident(incident)
    setSelectedResponderId(incident.assignedResponderId || '')
  }

  function closeIncidentModal() {
    setSelectedIncident(null)
    setSelectedResponderId('')
  }

  function assignResponder(incident) {
    if (!selectedResponderId) return

    const responder = demoResponders.find(
      (item) => item.id === selectedResponderId,
    )
    if (!responder) return

    setIncidents((previous) =>
      previous.map((item) =>
        item.id === incident.id
          ? {
              ...item,
              assignedResponderId: responder.id,
              assignedResponder: responder.name,
              assignedResponderRole: responder.role,
              status: item.status === 'Reported' ? 'Assigned' : item.status,
            }
          : item,
      ),
    )

    addActivity(`${responder.name} assigned to ${incident.id}`, 'team')
    setLastAction(
      `${responder.name} assigned to ${incident.id} using demo data.`,
    )
    closeIncidentModal()
  }

  function markIncidentResponding(incident) {
    setIncidents((previous) =>
      previous.map((item) =>
        item.id === incident.id
          ? { ...item, status: 'Responding' }
          : item,
      ),
    )

    addActivity(`Response initiated for ${incident.id}`, 'team')
    setLastAction(`Demo response started for ${incident.id}`)
    closeIncidentModal()
  }

  function createIncident(event) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') || '').trim()
    const location = String(form.get('location') || '').trim()

    if (!title || !location) return

    const highestId = incidents.reduce((highest, incident) => {
      const number = Number(incident.id.replace('INC-', '')) || 0
      return Math.max(highest, number)
    }, 240)

    const newIncident = {
      id: `INC-${String(highestId + 1).padStart(4, '0')}`,
      title,
      location,
      severity: String(form.get('severity') || 'High'),
      status: 'Reported',
      time: 'Just now',
      people: 1,
    }

    setIncidents((previous) => [newIncident, ...previous])
    addActivity(`New demo incident created: ${title}`)
    closeIncidentModal()
    setLastAction(
      'Incident added to local demo data only. Nothing was sent to a server.',
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={24} /></div>
          <div>
            <span className="brand-name">RescueSync</span>
            <span className="brand-caption">RESPONSE NETWORK</span>
          </div>
          <button
            className="icon-button sidebar-close"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switch">
          <div className="workspace-avatar">DR</div>
          <div className="workspace-copy">
            <strong>Disaster Response</strong>
            <span>Operations center</span>
          </div>
          <ChevronDown size={16} />
        </button>

        <div className="nav-label">OPERATIONS</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? 'active' : ''}`}
              onClick={() => handleNavigation(label)}
              aria-current={activePage === label ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Incidents' && (
                <span className="nav-count">{incidents.length}</span>
              )}
              {label === 'AI Recommendations' && (
                <span className="nav-new">AI</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="network-card">
            <div className="network-card-top">
              <span className="network-dot" />
              <span>Local demo network</span>
            </div>
            <p>Interface preview mode</p>
            <div className="network-meter"><span /></div>
            <span className="network-note">No live responders connected</span>
          </div>
          <button className="profile-row">
            <div className="profile-avatar">OP</div>
            <div className="profile-copy">
              <strong>Operations Lead</strong>
              <span>Demo account</span>
            </div>
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              Operations <span>/</span> <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="connection-pill">
              <span className="network-dot" />
              <span>Demo mode</span>
            </div>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <div className="topbar-divider" />
            <div className="topbar-user">
              <div className="profile-avatar">OP</div>
              <ChevronDown size={15} />
            </div>

            {notificationsOpen && (
              <div className="notification-popover">
                <strong>Recent notifications</strong>
                <p><AlertTriangle size={15} />{criticalCount} critical active demo incident(s)</p>
                <p><Cloud size={15} />Live notifications are not connected</p>
                <button onClick={() => setNotificationsOpen(false)}>Close</button>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">
          {activePage === 'Incidents' ? (
            <Incidents incidents={incidents} />
          ) : activePage === 'Rescue Tasks' ? (
            <RescueTasks incidents={incidents} />
          ) : activePage === 'Inventory' ? (
            <Inventory />
          ) : activePage === 'AI Recommendations' ? (
            <AIRecommendations
                   incidents={incidents}
                   setIncidents={setIncidents}
                    />
          ) : activePage === 'Sync Status' ? <SyncStatus /> 
          : (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" />
                    EMERGENCY OPERATIONS
                  </div>
                  <h1>
                    {activePage === 'Dashboard'
                      ? 'Situation overview'
                      : activePage}
                  </h1>
                  <p className="page-subtitle">
                    {activePage === 'Dashboard'
                      ? 'A clear view of incidents, response activity, and available resources.'
                      : `Explore ${activePage.toLowerCase()} using local demonstration data.`}
                  </p>
                </div>
                <div className="welcome-actions">
                  <span className="date-chip">
                    <Clock3 size={15} /> Demo environment
                  </span>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setSelectedResponderId('')
                      setSelectedIncident({
                        id: 'NEW',
                        title: '',
                        location: '',
                        severity: 'High',
                        status: 'New',
                        people: 1,
                        isNew: true,
                      })
                    }}
                  >
                    <span>+</span> Report incident
                  </button>
                </div>
              </section>

              {lastAction && (
                <div className="action-feedback" role="status">
                  <CheckCircle2 size={17} />
                  <span>{lastAction}</span>
                  <button
                    aria-label="Dismiss message"
                    onClick={() => setLastAction('')}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <section className="metrics-grid" aria-label="Incident summary">
                <MetricCard icon={AlertTriangle} label="Active incidents" value={activeIncidents.length} note="Open demo incidents" tone="blue" />
                <MetricCard icon={Activity} label="Critical incidents" value={criticalCount} note="Require close attention" tone="red" />
                <MetricCard icon={Users} label="Active response tasks" value="06" note="Sample task count" tone="purple" />
                <MetricCard icon={Package} label="Available resources" value="128" note="Sample inventory count" tone="green" />
              </section>

              <section className="overview-grid">
                <div className="panel incident-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">
                        <span className="status-dot red-dot" /> ACTIVE INCIDENTS
                      </div>
                      <h2>Incident overview</h2>
                      <p>Closed and verified incidents are kept out of this view</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => handleNavigation('Incidents')}
                    >
                      View all <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <div className="incident-controls">
                    <label className="search-box">
                      <Search size={17} />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search incidents..."
                        aria-label="Search incidents"
                      />
                      {search && (
                        <button
                          aria-label="Clear search"
                          onClick={() => setSearch('')}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </label>
                    <select
                      value={severityFilter}
                      onChange={(event) => setSeverityFilter(event.target.value)}
                      aria-label="Filter by severity"
                    >
                      <option>All</option>
                      <option>Critical</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>

                  <div className="incident-list">
                    {filteredIncidents.length === 0 ? (
                      <div className="empty-state">
                        No active incidents match your search.
                      </div>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <button
                          className="incident-row"
                          key={incident.id}
                          onClick={() => openIncident(incident)}
                        >
                          <div className={`incident-icon severity-${incident.severity.toLowerCase()}`}>
                            <AlertTriangle size={18} />
                          </div>
                          <div className="incident-info">
                            <strong>{incident.title}</strong>
                            <span>
                              <MapPin size={13} /> {incident.location}
                            </span>
                            <small>
                              {incident.id} <span>·</span> {incident.time}
                            </small>
                          </div>
                          <div className="incident-meta">
                            <span className={`severity-badge badge-${incident.severity.toLowerCase()}`}>
                              {incident.severity}
                            </span>
                            <span className="incident-status">{incident.status}</span>
                            {incident.assignedResponder && (
                              <span className="incident-status">
                                Assigned: {incident.assignedResponder}
                              </span>
                            )}
                          </div>
                          <ChevronDown className="incident-chevron" size={17} />
                        </button>
                      ))
                    )}
                  </div>

                  <div className="panel-footer">
                    <span>
                      Showing {filteredIncidents.length} of {activeIncidents.length} active incidents
                    </span>
                    <span className="footer-demo">
                      <span className="network-dot" /> Sample data
                    </span>
                  </div>
                </div>

                <div className="panel map-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">
                        <Radio size={13} /> AREA MONITOR
                      </div>
                      <h2>Response zones</h2>
                      <p>Illustrative operational map</p>
                    </div>
                    <button
                      className="icon-button panel-icon-button"
                      aria-label="Map information"
                      onClick={() =>
                        setLastAction(
                          'This is an illustrative map, not real geographic or GPS data.',
                        )
                      }
                    >
                      <MapPin size={18} />
                    </button>
                  </div>
                  <div className="map-illustration">
                    <div className="map-grid-lines" />
                    <div className="map-river" />
                    <div className="map-road road-one" />
                    <div className="map-road road-two" />
                    <div className="map-road road-three" />
                    <span className="map-area area-north">NORTH ZONE</span>
                    <span className="map-area area-east">EAST ZONE</span>
                    <span className="map-area area-central">CENTRAL</span>
                    <span className="map-area area-west">WEST ZONE</span>
                    <span className="map-pin pin-one"><AlertTriangle size={14} /></span>
                    <span className="map-pin pin-two"><Users size={14} /></span>
                    <span className="map-pin pin-three"><Package size={14} /></span>
                    <span className="map-pin pin-four"><AlertTriangle size={14} /></span>
                    <span className="map-legend">
                      <i className="legend-red" /> Incidents
                      <i className="legend-blue" /> Response units
                    </span>
                    <span className="map-watermark">
                      ILLUSTRATIVE MAP · NOT TO SCALE
                    </span>
                  </div>
                  <div className="map-summary">
                    <div>
                      <span className="summary-marker red-marker" />
                      <div>
                        <strong>{activeIncidents.length}</strong>
                        <span>Active incidents</span>
                      </div>
                    </div>
                    <div>
                      <span className="summary-marker blue-marker" />
                      <div>
                        <strong>3</strong>
                        <span>Sample response units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="lower-grid">
                <div className="panel ai-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker ai-kicker">
                        <Sparkles size={14} /> DECISION SUPPORT
                      </div>
                      <h2>AI recommendations</h2>
                      <p>Illustrative suggestions for operator review</p>
                    </div>
                    <span className="advisory-tag">Advisory only</span>
                  </div>
                  <div className="recommendation">
                    <div className="recommendation-icon">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="recommendation-body">
                      <div className="recommendation-title">
                        <strong>Prioritize riverbank assessment</strong>
                        <span className="severity-badge badge-critical">
                          High priority
                        </span>
                      </div>
                      <p>
                        Demo suggestion: verify flood conditions and check
                        whether nearby residents need assistance.
                      </p>
                      <div className="recommendation-meta">
                        <span><Users size={14} /> Suggested: assessment team</span>
                        <span><Clock3 size={14} /> Review promptly</span>
                      </div>
                    </div>
                  </div>
                  <div className="recommendation">
                    <div className="recommendation-icon teal-icon">
                      <Package size={18} />
                    </div>
                    <div className="recommendation-body">
                      <div className="recommendation-title">
                        <strong>Review emergency supply levels</strong>
                        <span className="severity-badge badge-medium">
                          Planning
                        </span>
                      </div>
                      <p>
                        Check the sample inventory and confirm water, first-aid,
                        and shelter supplies before allocation.
                      </p>
                      <div className="recommendation-meta">
                        <span><Package size={14} /> Inventory review</span>
                        <span><ShieldCheck size={14} /> Human verification</span>
                      </div>
                    </div>
                  </div>
                  <div className="advisory-note">
                    <ShieldCheck size={16} />
                    <span>
                      Recommendations are mock examples, not outputs from a
                      connected AI engine. Verify all actions with trained responders.
                    </span>
                  </div>
                </div>

                <div className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">
                        <Activity size={13} /> EVENT LOG
                      </div>
                      <h2>Recent activity</h2>
                      <p>Actions in this demo session</p>
                    </div>
                    <button
                      className="icon-button panel-icon-button"
                      aria-label="Refresh demo activity"
                      onClick={() =>
                        addActivity('Activity list refreshed locally')
                      }
                    >
                      <RefreshCw size={17} />
                    </button>
                  </div>
                  <div className="activity-list">
                    {activities.map((activity, index) => (
                      <div
                        className="activity-item"
                        key={`${activity.text}-${index}`}
                      >
                        <div className={`activity-icon activity-${activity.type}`}>
                          {activity.type === 'team' ? (
                            <Users size={16} />
                          ) : activity.type === 'resource' ? (
                            <Package size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                        <div className="activity-copy">
                          <strong>{activity.text}</strong>
                          <span>{activity.time}</span>
                        </div>
                        <span className="activity-check">
                          <CheckCircle2 size={16} />
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="activity-footer"
                    onClick={() => setActivities(initialActivities)}
                  >
                    Reset sample activity <ArrowUpRight size={15} />
                  </button>
                </div>
              </section>

              <footer className="page-footer">
                <span>
                  <Command size={14} /> RescueSync
                  <span className="footer-separator">/</span>
                  Disaster response coordination
                </span>
                <span>
                  <CloudOff size={14} /> Local preview · No live network connection
                </span>
              </footer>
            </>
          )}
        </div>
      </main>

      {selectedIncident && (
        <div className="modal-backdrop" onClick={closeIncidentModal}>
          <section
            className="incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="panel-kicker">INCIDENT DETAILS · DEMO</span>
                <h2 id="incident-modal-title">
                  {selectedIncident.isNew
                    ? 'Report an incident'
                    : selectedIncident.title}
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={closeIncidentModal}
              >
                <X size={19} />
              </button>
            </div>

            {selectedIncident.isNew ? (
              <form onSubmit={createIncident}>
                <label className="form-label">
                  Incident title
                  <input
                    name="title"
                    required
                    maxLength={100}
                    placeholder="e.g. Flooding near bridge"
                  />
                </label>
                <label className="form-label">
                  Area or location
                  <input
                    name="location"
                    required
                    maxLength={100}
                    placeholder="e.g. North zone"
                  />
                </label>
                <label className="form-label">
                  Severity
                  <select name="severity" defaultValue="High">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>
                <div className="modal-note">
                  <AlertTriangle size={15} />
                  This creates a local sample incident, not a real emergency report.
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeIncidentModal}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    Add demo incident
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="modal-detail-row">
                  <span>Incident ID</span>
                  <strong>{selectedIncident.id}</strong>
                </div>
                <div className="modal-detail-row">
                  <span>Location</span>
                  <strong>{selectedIncident.location}</strong>
                </div>
                <div className="modal-detail-row">
                  <span>Severity</span>
                  <span className={`severity-badge badge-${selectedIncident.severity.toLowerCase()}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <div className="modal-detail-row">
                  <span>Status</span>
                  <strong>{selectedIncident.status}</strong>
                </div>
                <div className="modal-detail-row">
                  <span>People potentially affected</span>
                  <strong>{selectedIncident.people} (sample)</strong>
                </div>
                <div className="modal-detail-row">
                  <span>Assigned responder</span>
                  <strong>
                    {selectedIncident.assignedResponder || 'Not assigned'}
                  </strong>
                </div>

                <div className="responder-assignment">
                  <label htmlFor="responder-select">Assign a responder</label>
                  <select
                    id="responder-select"
                    value={selectedResponderId}
                    onChange={(event) =>
                      setSelectedResponderId(event.target.value)
                    }
                  >
                    <option value="">Choose a responder</option>
                    {demoResponders.map((responder) => (
                      <option key={responder.id} value={responder.id}>
                        {responder.name} — {responder.role}
                      </option>
                    ))}
                  </select>
                  {selectedResponderId && (
                    <p className="responder-hint">
                      {
                        demoResponders.find(
                          (item) => item.id === selectedResponderId,
                        )?.skills
                      }
                    </p>
                  )}
                  <p className="responder-demo-note">
                    Demo responders only. Availability is not connected to a live system.
                  </p>
                </div>

                <div className="modal-note">
                  <ShieldCheck size={15} />
                  Demo record only. Confirm information with authorized responders.
                </div>
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    onClick={closeIncidentModal}
                  >
                    Close
                  </button>
                  <button
                    className="secondary-button"
                    disabled={!selectedResponderId}
                    onClick={() => assignResponder(selectedIncident)}
                  >
                    Assign responder
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => markIncidentResponding(selectedIncident)}
                  >
                    Mark responding
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${tone}`}>
        <Icon size={20} strokeWidth={1.9} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">
        <span className={`metric-note-dot dot-${tone}`} />
        {note}
      </div>
      <div className="metric-decoration" />
    </article>
  )
}

export default Dashboard
