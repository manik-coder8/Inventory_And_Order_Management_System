import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '../api/endpoints'
import { Card, Badge, Spinner, Alert } from '../components/ui'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">A snapshot of products, customers, and orders.</p>
      </header>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Spinner className="h-6 w-6" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total products" value={summary.total_products} to="/products" />
            <StatCard label="Total customers" value={summary.total_customers} to="/customers" />
            <StatCard label="Total orders" value={summary.total_orders} to="/orders" />
            <StatCard
              label="Low stock items"
              value={summary.low_stock_products.length}
              to="/products"
              tone={summary.low_stock_products.length > 0 ? 'amber' : 'slate'}
            />
          </div>

          <Card className="mt-6">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Low stock products
                <span className="ml-2 font-normal text-slate-400">
                  (at or below {summary.low_stock_threshold} units)
                </span>
              </h2>
            </div>
            {summary.low_stock_products.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                Nothing here yet &mdash; every product is well stocked.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.low_stock_products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">SKU: {p.sku}</p>
                    </div>
                    <Badge tone={p.quantity === 0 ? 'red' : 'amber'}>
                      {p.quantity} in stock
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  )
}

function StatCard({ label, value, to, tone = 'slate' }) {
  const toneText = tone === 'amber' ? 'text-amber-600' : 'text-slate-900'
  return (
    <Link to={to}>
      <Card className="p-5 hover:border-brand-300 transition-colors">
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`mt-2 text-3xl font-semibold ${toneText}`}>{value}</p>
      </Card>
    </Link>
  )
}
