import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  ListChecks,
  PlayCircle,
  Search,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { useDisasterState } from '../DisasterStateContext'
import './RescueTasks.css'

function RescueTasks({ incidents = [] }) {
  const { tasks, setTasks, setIncidents } = useDisasterState()

  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')

  const taskList = useMemo(() => {
    return tasks.map((task) => {
      const incident = incidents.find(
        (item) => item.id === task.incidentId
      )

      return {
        ...task,
        responder:
          incident?.assignedResponder ||
          task.responder ||
          'Unassigned',
      }
    })
  }, [tasks, incidents])

  const filteredTasks = taskList.filter((task) => {
    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter

    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter

    const searchText = search.toLowerCase()

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.id.toLowerCase().includes(searchText) ||
      task.incidentId.toLowerCase().includes(searchText) ||
      task.responder.toLowerCase().includes(searchText)

    return matchesStatus && matchesPriority && matchesSearch
  })

  const counts = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'Pending').length,
    progress: tasks.filter((task) => task.status === 'In Progress').length,
    completed: tasks.filter((task) => task.status === 'Completed').length,
  }

  const updateStatus = (taskId, newStatus) => {
    const task = tasks.find((item) => item.id === taskId)

    if (!task || task.status === newStatus) return

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === taskId
          ? { ...item, status: newStatus }
          : item
      )
    )

    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) => {
        if (incident.id !== task.incidentId) return incident

        const currentStatus = String(incident.status || '')
          .trim()
          .toLowerCase()

        if (['closed', 'verified'].includes(currentStatus)) {
          return incident
        }

        if (newStatus === 'Completed') {
          return { ...incident, status: 'Resolved' }
        }

        if (
          task.status === 'Completed' &&
          currentStatus === 'resolved'
        ) {
          return { ...incident, status: 'Responding' }
        }

        return incident
      })
    )

    setFeedback(`Task ${taskId} moved to ${newStatus}.`)

    // Clear the previous feedback without requiring another state system.
    window.setTimeout(() => {
      setFeedback((current) =>
        current === `Task ${taskId} moved to ${newStatus}.`
          ? ''
          : current
      )
    }, 2500)
  }

  return (
    <section className="rescue-tasks-page">
      <div className="rescue-tasks-header">
        <div>
          <p className="page-eyebrow">RESPONSE OPERATIONS</p>
          <h1>Rescue Tasks</h1>
          <p className="page-description">
            Track field tasks, assigned responders and response progress.
          </p>
        </div>

        <div className="demo-badge">Demo task data</div>
      </div>

      {feedback && (
        <div className="task-feedback">
          <CheckCircle2 size={17} />
          {feedback}
        </div>
      )}

      <div className="task-summary-grid">
        <div className="task-summary-card">
          <div className="task-summary-icon">
            <ListChecks size={20} />
          </div>
          <div>
            <span>Total Tasks</span>
            <strong>{counts.total}</strong>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="task-summary-icon pending">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{counts.pending}</strong>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="task-summary-icon progress">
            <PlayCircle size={20} />
          </div>
          <div>
            <span>In Progress</span>
            <strong>{counts.progress}</strong>
          </div>
        </div>

        <div className="task-summary-card">
          <div className="task-summary-icon completed">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{counts.completed}</strong>
          </div>
        </div>
      </div>

      <div className="task-toolbar">
        <div className="task-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search tasks, incidents or responders..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="tasks-table-card">
        <div className="tasks-table-header">
          <div>
            <h2>Active Response Tasks</h2>
            <p>{filteredTasks.length} task(s) shown</p>
          </div>
        </div>

        <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Incident</th>
                <th>Responder</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-title-cell">
                        <strong>{task.title}</strong>
                        <span>{task.id}</span>
                        <p>{task.description}</p>
                      </div>
                    </td>

                    <td>
                      <span className="incident-id">{task.incidentId}</span>
                    </td>

                    <td>
                      <div className="responder-cell">
                        <UserRound size={16} />
                        <span>{task.responder}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`task-priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`task-status ${task.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td>
                      <select
                        className="task-status-select"
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(task.id, event.target.value)
                        }
                        aria-label={`Update status for ${task.title}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-tasks">
                      <ShieldAlert size={28} />
                      <strong>No tasks found</strong>
                      <span>
                        Try changing the filters or search term.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default RescueTasks