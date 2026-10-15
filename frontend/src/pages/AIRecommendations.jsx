import { useMemo, useState } from 'react'
import {
  Sparkles, AlertTriangle, ShieldCheck, Clock3, Users,
  Package, CheckCircle2, X, Filter, Info, ArrowUpRight,
} from 'lucide-react'

import './AIRecommendations.css'
import { useDisasterState } from '../DisasterStateContext'

function AIRecommendations({ incidents = [] }) {
  const {
    reviewedRecommendations: reviewed,
    setReviewedRecommendations: setReviewed,
    dismissedRecommendations: dismissed,
    setDismissedRecommendations: setDismissed,
  } = useDisasterState()

  const [filter, setFilter] = useState('All')

  const recommendations = useMemo(() => {
    const severityRank = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    }

    return [...incidents]
      .sort(
        (a, b) =>
          (severityRank[b.severity] || 0) -
          (severityRank[a.severity] || 0),
      )
      .map((incident) => {
        const title = (incident.title || '').toLowerCase()

        let action = 'Verify the situation and identify the resources required.'
        let resource = 'Assessment team'
        let reason = 'The incident needs human assessment before resources are allocated.'

        if (
          title.includes('flood') ||
          title.includes('river') ||
          title.includes('water')
        ) {
          action = 'Assess water levels and check whether residents need evacuation or assistance.'
          resource = 'Flood rescue team'
          reason = 'Water-related incidents may require rapid field assessment.'
        } else if (
          title.includes('medical') ||
          title.includes('injury') ||
          title.includes('health')
        ) {
          action = 'Verify medical needs and check the availability of first-aid supplies.'
          resource = 'Medical response team'
          reason = 'Medical needs should be assessed by qualified personnel.'
        } else if (
          title.includes('road') ||
          title.includes('tree') ||
          title.includes('blocked')
        ) {
          action = 'Check access routes and assess whether a safe clearance team is required.'
          resource = 'Road clearance team'
          reason = 'Blocked routes may affect access for emergency responders.'
        } else if (
          title.includes('power') ||
          title.includes('electric')
        ) {
          action = 'Check affected facilities and identify any safety or backup-power needs.'
          resource = 'Utility assessment team'
          reason = 'Power disruptions may affect shelters and essential services.'
        } else if (
          title.includes('shelter') ||
          title.includes('supply')
        ) {
          action = 'Verify shelter capacity and check essential supply levels.'
          resource = 'Supply coordination team'
          reason = 'Shelters may need additional supplies or operational support.'
        }

        return {
          id: incident.id,
          incidentId: incident.id,
          title: incident.title,
          location: incident.location || 'Location not provided',
          severity: incident.severity || 'Low',
          status: incident.status,
          people: incident.people ?? 0,
          action,
          resource,
          reason,
        }
      })
  }, [incidents])

  const visibleRecommendations = recommendations.filter((item) => {
    if (dismissed.includes(item.id)) return false
    if (filter === 'All') return true
    if (filter === 'Needs review') return !reviewed.includes(item.id)
    if (filter === 'Reviewed') return reviewed.includes(item.id)
    return item.severity === filter
  })

  const reviewedCount = recommendations.filter(
    (item) => reviewed.includes(item.id),
  ).length

  function markReviewed(id) {
    setReviewed((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    )
  }

  function dismissRecommendation(id) {
    setDismissed((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    )
  }

  function restoreRecommendations() {
    setDismissed([])
    setReviewed([])
    setFilter('All')
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
            These are rule-based examples generated from local incident data,
            not predictions from a connected AI model. Verify all suggestions
            with authorized emergency personnel.
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
          <small>Based on current demo incidents</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-red">
            <AlertTriangle size={19} />
          </div>
          <span>Critical incidents</span>
          <strong>
            {recommendations.filter(
              (item) => item.severity === 'Critical',
            ).length}
          </strong>
          <small>Require operator attention</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-purple">
            <Clock3 size={19} />
          </div>
          <span>Awaiting review</span>
          <strong>
            {recommendations.filter(
              (item) =>
                !reviewed.includes(item.id) &&
                !dismissed.includes(item.id),
            ).length}
          </strong>
          <small>Not yet marked reviewed</small>
        </article>

        <article className="ai-summary-card">
          <div className="ai-summary-icon ai-icon-green">
            <CheckCircle2 size={19} />
          </div>
          <span>Reviewed</span>
          <strong>{reviewedCount}</strong>
          <small>Reviewed in this session</small>
        </article>
      </section>

      <section className="ai-recommendations-panel">
        <div className="ai-list-header">
          <div>
            <h2>Suggested response actions</h2>
            <p>Prioritized by incident severity, not live risk prediction.</p>
          </div>

          <label className="ai-filter">
            <Filter size={16} />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter recommendations"
            >
              <option value="All">All suggestions</option>
              <option value="Needs review">Needs review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>

        {visibleRecommendations.length === 0 ? (
          <div className="ai-empty-state">
            <CheckCircle2 size={30} />
            <h3>No recommendations to display</h3>
            <p>
              There are no items matching this filter. You can restore
              dismissed suggestions or review the incident list.
            </p>
            <button
              className="ai-secondary-button"
              onClick={restoreRecommendations}
            >
              Reset review state
            </button>
          </div>
        ) : (
          <div className="ai-recommendation-list">
            {visibleRecommendations.map((item, index) => {
              const isReviewed = reviewed.includes(item.id)

              return (
                <article
                  className={`ai-recommendation-card ${
                    isReviewed ? 'ai-card-reviewed' : ''
                  }`}
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

                    <span className="ai-incident-id">{item.incidentId}</span>

                    {isReviewed && (
                      <span className="ai-reviewed-tag">
                        <CheckCircle2 size={13} />
                        Reviewed
                      </span>
                    )}
                  </div>

                  <h3>{item.title}</h3>

                  <div className="ai-incident-meta">
                    <span>
                      <ArrowUpRight size={14} />
                      {item.location}
                    </span>
                    <span>
                      <Users size={14} />
                      {item.people} potentially affected (sample)
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

                  <div className="ai-card-footer">
                    <span className="ai-demo-label">
                      <Info size={14} />
                      Demo suggestion · Not dispatched
                    </span>

                    <div className="ai-card-actions">
                      <button
                        className="ai-dismiss-button"
                        onClick={() => dismissRecommendation(item.id)}
                        aria-label={`Dismiss recommendation for ${item.incidentId}`}
                      >
                        <X size={15} />
                        Dismiss
                      </button>

                      <button
                        className="ai-review-button"
                        onClick={() => markReviewed(item.id)}
                        disabled={isReviewed}
                      >
                        <CheckCircle2 size={15} />
                        {isReviewed ? 'Reviewed' : 'Mark reviewed'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="ai-panel-footer">
          <span>
            Showing {visibleRecommendations.length} of {recommendations.length}{' '}
            recommendations
          </span>
          <button onClick={restoreRecommendations}>
            Reset demo review state
          </button>
        </div>
      </section>

      <div className="ai-bottom-note">
        <ShieldCheck size={17} />
        No responders are assigned and no real-world actions are triggered
        by this page.
      </div>
    </div>
  )
}

export default AIRecommendations