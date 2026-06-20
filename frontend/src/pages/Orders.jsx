import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, getCustomers, getProducts, createOrder, cancelOrder } from '../api/endpoints'
import { Card, Button, Badge, Select, Input, EmptyState, Spinner, Alert } from '../components/ui'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o)
        setCustomers(c)
        setProducts(p)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadAll, [])

  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  const handleCancel = async (order) => {
    if (!confirm(`Cancel order #${order.id}? Reserved stock will be restored.`)) return
    setError('')
    try {
      await cancelOrder(order.id)
      setSuccessMsg(`Order #${order.id} cancelled.`)
      loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Create orders and track fulfillment.</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          disabled={customers.length === 0 || products.length === 0}
        >
          + Create order
        </Button>
      </header>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {successMsg && <div className="mb-4"><Alert tone="green">{successMsg}</Alert></div>}

      {!loading && (customers.length === 0 || products.length === 0) && (
        <div className="mb-4">
          <Alert tone="amber">
            You need at least one customer and one product before you can create an order.{' '}
            <Link to="/customers" className="underline">Add a customer</Link> or{' '}
            <Link to="/products" className="underline">add a product</Link>.
          </Alert>
        </div>
      )}

      {formOpen && (
        <CreateOrderForm
          customers={customers}
          products={products}
          onClose={() => setFormOpen(false)}
          onCreated={() => {
            setFormOpen(false)
            setSuccessMsg('Order created.')
            loadAll()
          }}
          onError={setError}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Spinner className="h-6 w-6" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders you create will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  const statusTone = { pending: 'amber', confirmed: 'green', cancelled: 'red' }[order.status] || 'slate'

  return (
    <Card className="overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-900">Order #{order.id}</span>
          <Badge tone={statusTone}>{order.status}</Badge>
          <span className="text-sm text-slate-500">{order.customer?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-900">${Number(order.total_amount).toFixed(2)}</span>
          <span className="text-slate-400">{expanded ? '\u2212' : '+'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Items</p>
          <ul className="mb-4 space-y-1.5">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-700">
                  {item.product?.name || `Product #${item.product_id}`} &times; {item.quantity}
                </span>
                <span className="text-slate-500">${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Placed {new Date(order.created_at).toLocaleString()}</span>
            {order.status !== 'cancelled' && (
              <Button variant="danger" className="px-2.5 py-1" onClick={() => onCancel(order)}>
                Cancel order
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

function CreateOrderForm({ customers, products, onClose, onCreated, onError }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '')
  const [lines, setLines] = useState([{ product_id: products[0]?.id ?? '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  const addLine = () => setLines([...lines, { product_id: products[0]?.id ?? '', quantity: 1 }])
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx))
  const updateLine = (idx, field, value) =>
    setLines(lines.map((l, i) => (i === idx ? { ...l, [field]: value } : l)))

  const productById = (id) => products.find((p) => p.id === Number(id))
  const estimatedTotal = lines.reduce((sum, l) => {
    const p = productById(l.product_id)
    return sum + (p ? Number(p.price) * Number(l.quantity || 0) : 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!customerId) return setLocalError('Please select a customer.')
    if (lines.length === 0) return setLocalError('Add at least one product line.')
    for (const l of lines) {
      if (!l.product_id || !l.quantity || Number(l.quantity) <= 0) {
        return setLocalError('Every line needs a product and a quantity greater than 0.')
      }
    }
    setSubmitting(true)
    try {
      await createOrder({
        customer_id: Number(customerId),
        items: lines.map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) })),
      })
      onCreated()
    } catch (err) {
      setLocalError(err.message)
      onError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mb-6 p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Create a new order</h2>
      {localError && <div className="mb-4"><Alert>{localError}</Alert></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
          ))}
        </Select>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Products</p>
          <div className="space-y-3">
            {lines.map((line, idx) => {
              const product = productById(line.product_id)
              return (
                <div key={idx} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Select
                      label={idx === 0 ? 'Product' : undefined}
                      value={line.product_id}
                      onChange={(e) => updateLine(idx, 'product_id', e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} &mdash; ${Number(p.price).toFixed(2)} ({p.quantity} in stock)
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-28">
                    <Input
                      label={idx === 0 ? 'Qty' : undefined}
                      type="number"
                      min="1"
                      step="1"
                      max={product?.quantity ?? undefined}
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                    />
                  </div>
                  {lines.length > 1 && (
                    <Button type="button" variant="ghost" className="px-2.5 py-2" onClick={() => removeLine(idx)}>
                      Remove
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
          <Button type="button" variant="secondary" className="mt-3" onClick={addLine}>
            + Add another product
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-700">Estimated total</span>
          <span className="text-sm font-semibold text-slate-900">${estimatedTotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4" />}
            Create order
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
