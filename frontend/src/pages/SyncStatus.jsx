
import { useState } from 'react'
import {
  Network,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Laptop,
  Radio,
} from 'lucide-react'
import './SyncStatus.css'

function SyncStatus() {
  const [offline, setOffline] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState('Just now')
  const [pending, setPending] = useState(3)

  function syncNow() {
    if (offline || syncing) return

    setSyncing(true)

    window.setTimeout(() => {
      setPending(0)
      setLastSync('Just now')
      setSyncing(false)
    }, 900)
  }

  return (
    <section className="sync-page">
      <header className="sync-header">
        <div>
          <p className="sync-eyebrow">DECENTRALIZED NETWORK</p>
          <h1>Sync Status</h1>
          <p>Monitor peer connectivity and local data synchronization.</p>
        </div>
        <span className={`sync-pill ${offline ? 'offline' : 'online'}`}>
          {offline ? <WifiOff size={15} /> : <Wifi size={15} />}
          {offline ? 'Offline mode' : 'Network connected'}
        </span>
      </header>

      <div className="sync-banner">
        <Network size={23} />
        <div>
          <strong>{offline ? 'Operating locally' : 'Peer network available'}</strong>
          <p>
            {offline
              ? 'Updates remain on this device until connectivity returns.'
              : 'This demo simulates peer connectivity and synchronization.'}
          </p>
        </div>
      </div>

      <div className="sync-stats">
        <article className="sync-card">
          <Network size={21} />
          <span>Connected peers</span>
          <strong>{offline ? 0 : 3}</strong>
          <small>{offline ? 'Connection unavailable' : 'Demo peers'}</small>
        </article>

        <article className="sync-card">
          <Clock3 size={21} />
          <span>Pending updates</span>
          <strong>{pending}</strong>
          <small>{pending ? 'Waiting to synchronize' : 'All demo updates synced'}</small>
        </article>

        <article className="sync-card">
          <CheckCircle2 size={21} />
          <span>Last synchronization</span>
          <strong className="sync-time">{lastSync}</strong>
          <small>Local demo status</small>
        </article>
      </div>

      <section className="sync-panel">
        <div className="sync-panel-heading">
          <div>
            <h2>Peer network</h2>
            <p>Example nodes in the disaster-response network.</p>
          </div>
          <Radio size={22} />
        </div>

        {[
          ['Peer A · Command Center', 'Central coordination node'],
          ['Peer B · Field Team', 'Responder device'],
          ['Peer C · Medical Unit', 'Medical response node'],
        ].map(([name, description], index) => (
          <div className="sync-peer" key={name}>
            <div className="sync-peer-icon"><Laptop size={19} /></div>
            <div className="sync-peer-info">
              <strong>{name}</strong>
              <span>{description}</span>
            </div>
            <span className={`peer-status ${offline ? 'offline' : 'online'}`}>
              {offline ? 'Offline' : 'Connected'}
            </span>
          </div>
        ))}

        <div className="sync-actions">
          <button
            className="sync-button"
            onClick={() => setOffline((value) => !value)}
          >
            {offline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {offline ? 'Restore connection' : 'Simulate offline mode'}
          </button>

          <button
            className="sync-button primary"
            onClick={syncNow}
            disabled={offline || syncing || pending === 0}
          >
            <RefreshCw size={16} />
            {syncing ? 'Synchronizing...' : 'Sync now'}
          </button>
        </div>
        <p className="sync-disclaimer">
          Prototype simulation only. No actual peer-to-peer networking is connected.
        </p>
      </section>
    </section>
  )
}

export default SyncStatus
