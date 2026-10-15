import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import { DisasterStateContext } from './DisasterStateContext'

const initialIncidents = [
  {
    id: 'INC-0241',
    title: 'Flooding near riverbank',
    location: 'North District · Sector 04',
    severity: 'Critical',
    status: 'Responding',
    time: '4 min ago',
    people: 24,
  },
  {
    id: 'INC-0240',
    title: 'Road blocked by fallen trees',
    location: 'East District · Sector 02',
    severity: 'High',
    status: 'Assigned',
    time: '12 min ago',
    people: 8,
  },
  {
    id: 'INC-0239',
    title: 'Medical assistance requested',
    location: 'Central District · Sector 01',
    severity: 'Medium',
    status: 'In progress',
    time: '18 min ago',
    people: 3,
  },
  {
    id: 'INC-0238',
    title: 'Power outage in shelter area',
    location: 'West District · Sector 07',
    severity: 'Low',
    status: 'Monitoring',
    time: '31 min ago',
    people: 16,
  },
]

const initialTasks = [
  {
    id: 'TASK-001',
    incidentId: 'INC-0241',
    title: 'Assess riverbank flooding',
    description:
      'Check water level and identify people requiring immediate evacuation.',
    priority: 'Critical',
    status: 'In Progress',
    responder: 'Arun Kumar',
  },
  {
    id: 'TASK-002',
    incidentId: 'INC-0240',
    title: 'Clear blocked road',
    description:
      'Inspect fallen trees and coordinate safe road clearance.',
    priority: 'High',
    status: 'Pending',
    responder: 'Rahul Das',
  },
  {
    id: 'TASK-003',
    incidentId: 'INC-0239',
    title: 'Provide medical assistance',
    description:
      'Reach the reported location and assess the medical request.',
    priority: 'Medium',
    status: 'Pending',
    responder: 'Priya Sharma',
  },
  {
    id: 'TASK-004',
    incidentId: 'INC-0238',
    title: 'Check shelter power supply',
    description:
      'Inspect the shelter area and report the power situation.',
    priority: 'Low',
    status: 'Completed',
    responder: 'Meena Raj',
  },
]

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [incidents, setIncidents] = useState(initialIncidents)
  const [tasks, setTasks] = useState(initialTasks)
  const [reviewedRecommendations, setReviewedRecommendations] = useState([])
  const [dismissedRecommendations, setDismissedRecommendations] = useState([])

  const sharedState = {
    incidents,
    setIncidents,
    tasks,
    setTasks,
    reviewedRecommendations,
    setReviewedRecommendations,
    dismissedRecommendations,
    setDismissedRecommendations,
  }
return (
  <DisasterStateContext.Provider value={sharedState}>
    <Dashboard
      activePage={activePage}
      onNavigate={setActivePage}
      incidents={incidents}
      setIncidents={setIncidents}
    />
  </DisasterStateContext.Provider>
)
}

export default App