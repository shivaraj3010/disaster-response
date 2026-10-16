
import { useMemo, useState } from 'react'
import {
  Package,
  Search,
  Droplets,
  HeartPulse,
  Utensils,
  Tent,
  Radio,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Boxes,
} from 'lucide-react'
import './Inventory.css'

const initialInventory = [
  { id: 'SUP-001', name: 'Drinking Water', category: 'Water', quantity: 240, minimum: 100, unit: 'bottles', location: 'North Warehouse', icon: Droplets },
  { id: 'SUP-002', name: 'First-Aid Kits', category: 'Medical', quantity: 35, minimum: 40, unit: 'kits', location: 'Central Store', icon: HeartPulse },
  { id: 'SUP-003', name: 'Food Packets', category: 'Food', quantity: 180, minimum: 60, unit: 'packets', location: 'East Warehouse', icon: Utensils },
  { id: 'SUP-004', name: 'Emergency Blankets', category: 'Shelter', quantity: 75, minimum: 30, unit: 'blankets', location: 'West Warehouse', icon: Tent },
  { id: 'SUP-005', name: 'Portable Radios', category: 'Equipment', quantity: 12, minimum: 15, unit: 'radios', location: 'Central Store', icon: Radio },
  { id: 'SUP-006', name: 'Medical Water Packs', category: 'Water', quantity: 90, minimum: 40, unit: 'packs', location: 'North Warehouse', icon: Droplets },
]

function Inventory() {
  const [items, setItems] = useState(initialInventory)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [feedback, setFeedback] = useState('')

  const getStockStatus = (item) => {
    if (item.quantity === 0) return 'Out of stock'
    if (item.quantity <= item.minimum) return 'Low stock'
    return 'In stock'
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        `${item.name} ${item.id} ${item.location}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'All' || item.category === categoryFilter

      const status = getStockStatus(item)
      const matchesStock =
        stockFilter === 'All' || stockFilter === status

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [items, search, categoryFilter, stockFilter])

  const lowStockCount = items.filter(
    (item) => item.quantity > 0 && item.quantity <= item.minimum
  ).length

  const outOfStockCount = items.filter(
    (item) => item.quantity === 0
  ).length

  function updateQuantity(id, amount) {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + amount) }
          : item
      )
    )

    const item = items.find((entry) => entry.id === id)
    if (item) {
      setFeedback(`${item.name} stock updated in local demo data.`)
    }
  }

  return (
    <section className="inventory-page">
      <header className="inventory-header">
        <div>
          <span className="inventory-eyebrow">RESOURCE MANAGEMENT</span>
          <h1>Emergency Inventory</h1>
          <p>Monitor supplies and identify resources that need replenishment.</p>
        </div>
        <span className="inventory-demo-label">Demo inventory</span>
      </header>

      {feedback && (
        <div className="inventory-feedback" role="status">
          <CheckCircle2 size={17} />
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <div className="inventory-summary">
        <article className="inventory-summary-card">
          <div className="inventory-summary-icon">
            <Boxes size={21} />
          </div>
          <div>
            <span>Supply types</span>
            <strong>{items.length}</strong>
          </div>
        </article>

        <article className="inventory-summary-card">
          <div className="inventory-summary-icon stock-good">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Stock available</span>
            <strong>
              {items.filter((item) => item.quantity > item.minimum).length}
            </strong>
          </div>
        </article>

        <article className="inventory-summary-card">
          <div className="inventory-summary-icon stock-low">
            <AlertTriangle size={21} />
          </div>
          <div>
            <span>Low stock</span>
            <strong>{lowStockCount}</strong>
          </div>
        </article>

        <article className="inventory-summary-card">
          <div className="inventory-summary-icon stock-empty">
            <Package size={21} />
          </div>
          <div>
            <span>Out of stock</span>
            <strong>{outOfStockCount}</strong>
          </div>
        </article>
      </div>

      <div className="inventory-toolbar">
        <label className="inventory-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search supplies or locations..."
          />
        </label>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All categories</option>
          <option value="Water">Water</option>
          <option value="Medical">Medical</option>
          <option value="Food">Food</option>
          <option value="Shelter">Shelter</option>
          <option value="Equipment">Equipment</option>
        </select>

        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          aria-label="Filter by stock status"
        >
          <option value="All">All stock levels</option>
          <option value="In stock">In stock</option>
          <option value="Low stock">Low stock</option>
          <option value="Out of stock">Out of stock</option>
        </select>
      </div>

      {lowStockCount > 0 && (
        <div className="inventory-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Replenishment required</strong>
            <p>
              {lowStockCount} supply type(s) are at or below their minimum
              stock level. Review them before allocating resources.
            </p>
          </div>
        </div>
      )}

      <div className="inventory-table-card">
        <div className="inventory-table-heading">
          <div>
            <h2>Supply stock</h2>
            <p>{filteredItems.length} item(s) displayed</p>
          </div>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Supply item</th>
                <th>Category</th>
                <th>Available quantity</th>
                <th>Minimum stock</th>
                <th>Storage location</th>
                <th>Status</th>
                <th>Adjust stock</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon
                  const status = getStockStatus(item)

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="inventory-item-cell">
                          <span className="inventory-item-icon">
                            <Icon size={19} />
                          </span>
                          <div>
                            <strong>{item.name}</strong>
                            <small>{item.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{item.category}</td>

                      <td>
                        <strong className="inventory-quantity">
                          {item.quantity}
                        </strong>{' '}
                        <span className="inventory-unit">{item.unit}</span>
                      </td>

                      <td>{item.minimum} {item.unit}</td>

                      <td>{item.location}</td>

                      <td>
                        <span
                          className={`inventory-status ${
                            status === 'In stock'
                              ? 'status-good'
                              : status === 'Low stock'
                                ? 'status-low'
                                : 'status-empty'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-adjust">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity === 0}
                            aria-label={`Decrease ${item.name} stock`}
                          >
                            <Minus size={15} />
                          </button>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label={`Increase ${item.name} stock`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="inventory-empty">
                      <Package size={28} />
                      <strong>No supplies found</strong>
                      <span>Try changing your search or filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-footer-note">
          <AlertTriangle size={15} />
          Stock changes are temporary and remain in this page's local demo
          state. No real inventory system is connected.
        </div>
      </div>
    </section>
  )
}

export default Inventory
