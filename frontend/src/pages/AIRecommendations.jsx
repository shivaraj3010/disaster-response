
import { useMemo, useContext } from 'react'
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Users,
  Package,
  CheckCircle2,
  X,
  ArrowUpRight,
} from 'lucide-react'
import { DisasterStateContext } from '../DisasterStateContext'
import './AIRecommendations.css'

function AIRecommendations({ incidents = [], setIncidents }) {
  const { tasks = [], setTasks } = useContext(DisasterStateContext)

  const recommendations = useMemo(() => {
    const severityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 }

    return [...incidents]
      .filter(
        (incident) =>
          !['closed', 'verified', 'resolved'].includes(
            String(incident.status || '').trim().toLowerCase()
          )
      )
      .sort(
        (a, b) =>
          (severityRank[b.severity] || 0) -
          (severityRank[a.severity] || 0)
      )
      .map((incident) => {
        const title = (incident.title || '').toLowerCase()

        let action = 'Verify the situation and identify required resources.'
        let resource = 'Assessment team'
        let reason =
          'Human assessment is needed before resources are allocated.'

        if (
          title.includes('flood') ||
          title.includes('river') ||
          title.includes('water')
        ) {
          action =
            'Assess water levels and identify residents needing evacuation or assistance.'
          resource = 'Flood rescue team'
          reason =
            'Water-related incidents may require rapid field assessment.'
        } else if (
          title.includes('medical') ||
          title.includes('injury') ||
          title.includes('health')
        ) {
          action =
            'Verify medical needs and check first-aid supply availability.'
          resource = 'Medical response team'
          reason =
            'Medical needs should be assessed by qualified personnel.'
        } else if (
          title.includes('road') ||
          title.includes('tree') ||
          title.includes('blocked')
        ) {
          action =
            'Check access routes and assess whether safe road clearance is required.'
          resource = 'Road clearance team'
          reason =
            'Blocked routes can prevent emergency responders from reaching people.'
        } else if (
          title.includes('power') ||
          title.includes('electric')
        ) {
          action =
            'Check affected facilities and identify backup-power needs.'
          resource = 'Utility assessment team'
          reason =
            'Power disruptions can affect shelters and essential services.'
        } else if (
          title.includes('shelter') ||
          title.includes('supply')
        ) {
          action =
            'Verify shelter capacity and essential supply levels.'
          resource = 'Supply coordination team'
          reason =
            'Shelters may need additional supplies or operational support.'
        }

        return {
          ...incident,
          action,
          resource,
          reason,
          location: incident.location || 'Location not provided',
        }
      })
  }, [incidents])

  const incidentsAwaitingReview = incidents.filter(
    (incident) => incident.status === 'Waiting for Review'
  )

  function approveIncident(incidentId) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? { ...incident, status: 'Resolved' }
          : incident
      )
    )
  }

  function rejectIncident(incidentId) {
    // Return the incident to Pending.
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? { ...incident, status: 'Pending' }
          : incident
      )
    )

    // Return only the rescue tasks linked to this incident to Pending.
    if (typeof setTasks === 'function') {
      setTasks((current) =>
        current.map((task) =>
          task.incidentId === incidentId
            ? { ...task, status: 'Pending' }
            : task
        )
      )
    }
  }

  return (
    <div className="ai-recommendations-page">
      <section className="ai-page-header">
        <div>
          <div className="ai-eyebrow">
            <Sparkles size={15} />
            DECISION SUPPORT
          </div>
          <h1>AI Recommendations</h1>
          <p>
            Review incident priorities and suggested response actions.
            Operators remain responsible for every decision.
          </p>
        </div>
        <div className="ai-demo-status">
          <span className="ai-status-dot" />
          Demo analysis
        </div>
      </section>

      <section className="ai-safety-banner">
        <div className="ai-safety-icon">
          <ShieldCheck size={21} />
        </div>
        <div>
          <strong>Human verification required</strong>
          <p>
            These are rule-based demo suggestions, not predictions from a
            connected AI model. Verify suggestions with authorized personnel.
          </p>
        </div>
      </section>

      <section className="ai-summary-grid">
        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-blue">
            <Sparkles size={19} />
          </div>
          <span>Total suggestions</span>
          <strong>{recommendations.length}</strong>
          <small>Based on active demo incidents</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-red">
            <AlertTriangle size={19} />
          </div>
          <span>Critical incidents</span>
          <strong>
            {recommendations.filter(
              (item) => item.severity === 'Critical'
            ).length}
          </strong>
          <small>Require operator attention</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-purple">
            <Users size={19} />
          </div>
          <span>Awaiting resolution review</span>
          <strong>{incidentsAwaitingReview.length}</strong>
          <small>Completed tasks awaiting approval</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-green">
            <CheckCircle2 size={19} />
          </div>
          <span>Active incidents</span>
          <strong>{recommendations.length}</strong>
          <small>Requiring response or monitoring</small>
        </article>
      </section>

      <section className="ai-recommendations-panel">
        <div className="ai-list-header">
          <div>
            <h2>Incident Resolution Review</h2>
            <p>Verify completed rescue tasks before resolving incidents.</p>
          </div>
          <strong>
            {incidentsAwaitingReview.length} awaiting review
          </strong>
        </div>

        {incidentsAwaitingReview.length === 0 ? (
          <div className="ai-empty-state">
            <CheckCircle2 size={30} />
            <h3>No incidents are waiting for review</h3>
            <p>Complete a rescue task to send its incident for review.</p>
          </div>
        ) : (
          <div className="ai-recommendation-list">
            {incidentsAwaitingReview.map((incident) => (
              <article
                className="ai-recommendation-card"
                key={incident.id}
              >
                <h3>{incident.title}</h3>
                <p>
                  {incident.id} · {incident.location}
                </p>
                <p>Severity: {incident.severity}</p>

                <div className="ai-card-actions">
                  <button
                    className="ai-review-button"
                    onClick={() => approveIncident(incident.id)}
                  >
                    <CheckCircle2 size={15} />
                    Approve Resolution
                  </button>

                  <button
                    className="ai-dismiss-button"
                    onClick={() => rejectIncident(incident.id)}
                  >
                    <X size={15} />
                    Reject — Needs More Work
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="ai-recommendations-panel">
        <div className="ai-list-header">
          <div>
            <h2>Suggested response actions</h2>
            <p>
              Prioritized by incident severity, not live risk prediction.
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="ai-empty-state">
            <CheckCircle2 size={30} />
            <h3>No active incidents</h3>
            <p>New active incidents will appear here.</p>
          </div>
        ) : (
          <div className="ai-recommendation-list">
            {recommendations.map((item, index) => (
              <article
                className="ai-recommendation-card"
                key={item.id}
              >
                <div className="ai-card-topline">
                  <span className="ai-card-number">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`ai-severity ai-severity-${(
                      item.severity || 'Low'
                    ).toLowerCase()}`}
                  >
                    {item.severity || 'Unclassified'}
                  </span>
                  <span className="ai-incident-id">{item.id}</span>
                </div>

                <h3>{item.title}</h3>

                <div className="ai-incident-meta">
                  <span>
                    <ArrowUpRight size={14} />
                    {item.location}
                  </span>
                  <span>
                    <Users size={14} />
                    {item.people ?? 0} potentially affected (sample)
                  </span>
                </div>

                <div className="ai-action-box">
                  <div className="ai-action-icon">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <span className="ai-field-label">
                      SUGGESTED ACTION
                    </span>
                    <p>{item.action}</p>
                  </div>
                </div>

                <div className="ai-card-details">
                  <div>
                    <span className="ai-field-label">
                      SUGGESTED RESOURCE
                    </span>
                    <strong>
                      <Package size={15} />
                      {item.resource}
                    </strong>
                  </div>
                  <div>
                    <span className="ai-field-label">
                      WHY THIS IS SUGGESTED
                    </span>
                    <p>{item.reason}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="ai-bottom-note">
        <ShieldCheck size={17} />
        Demo recommendations only. No real-world actions are triggered.
      </div>
    </div>
  )
}

export default AIRecommendations
