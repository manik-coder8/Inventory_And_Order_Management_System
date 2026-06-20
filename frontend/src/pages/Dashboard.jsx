import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { getDashboardSummary, getDashboardCharts } from '../api/endpoints'
import { Card, Badge, Spinner, Alert, SectionEyebrow } from '../components/ui'

const INK = '#1C2630'
const SIGNAL = '#E8762C'
const FOREST = '#3D7A5C'
const GRID = '#EDE9E0'
const MUTED = '#8A8378'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardSummary(), getDashboardCharts()])
      .then(([s, c]) => {
        setSummary(s)
        setCharts(c)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <header className="mb-8">
        <SectionEyebrow>Overview</SectionEyebrow>
        <h1 className="mt-1.5 font-display text-3xl font-semibold text-ink-900">Dashboard</h1>
        <p className="mt-1.5 text-sm text-ink-500">A snapshot of products, customers, and orders.</p>
      </header>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20 text-ink-400">
          <Spinner className="h-6 w-6" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total products" value={summary.total_products} to="/products" index="01" />
            <StatCard label="Total customers" value={summary.total_customers} to="/customers" index="02" />
            <StatCard label="Total orders" value={summary.total_orders} to="/orders" index="03" />
            <StatCard
              label="Low stock items"
              value={summary.low_stock_products.length}
              to="/products"
              index="04"
              flagged={summary.low_stock_products.length > 0}
            />
          </div>

          {charts && (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard
                eyebrow="Inventory"
                title="Stock levels"
                subtitle="Top 10 products by quantity on hand"
              >
                {charts.stock_levels.length === 0 ? (
                  <ChartEmpty text="Add products to see stock levels." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={charts.stock_levels} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: MUTED, fontFamily: 'IBM Plex Mono' }}
                        axisLine={{ stroke: GRID }}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis tick={{ fontSize: 11, fill: MUTED, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        cursor={{ fill: 'rgba(20,25,31,0.04)' }}
                        contentStyle={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 12,
                          border: '1px solid #EDE9E0',
                          borderRadius: 6,
                          boxShadow: '0 4px 16px rgba(20,25,31,0.08)',
                        }}
                        formatter={(value) => [`${value} units`, 'In stock']}
                      />
                      <Bar dataKey="quantity" radius={[3, 3, 0, 0]} maxBarSize={36}>
                        {charts.stock_levels.map((entry, i) => (
                          <Cell key={i} fill={entry.low_stock ? SIGNAL : INK} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <Legend items={[{ color: INK, label: 'Healthy stock' }, { color: SIGNAL, label: 'Low stock' }]} />
              </ChartCard>

              <ChartCard
                eyebrow="Activity"
                title="Orders trend"
                subtitle="Daily order volume, last 14 days"
              >
                {charts.orders_trend.every((d) => d.orders === 0) ? (
                  <ChartEmpty text="Orders you create will appear here over time." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={charts.orders_trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: MUTED, fontFamily: 'IBM Plex Mono' }}
                        axisLine={{ stroke: GRID }}
                        tickLine={false}
                        interval={2}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: MUTED, fontFamily: 'IBM Plex Mono' }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 12,
                          border: '1px solid #EDE9E0',
                          borderRadius: 6,
                          boxShadow: '0 4px 16px rgba(20,25,31,0.08)',
                        }}
                        labelFormatter={(label) => label}
                        formatter={(value) => [`${value} order${value === 1 ? '' : 's'}`, '']}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke={SIGNAL}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: SIGNAL, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                eyebrow="Performance"
                title="Revenue by product"
                subtitle="Top 8 products, confirmed orders only"
                className="lg:col-span-2"
              >
                {charts.revenue_by_product.length === 0 ? (
                  <ChartEmpty text="Revenue breakdown appears once orders are placed." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={charts.revenue_by_product}
                      layout="vertical"
                      margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid stroke={GRID} horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: MUTED, fontFamily: 'IBM Plex Mono' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: INK, fontFamily: 'IBM Plex Sans' }}
                        axisLine={false}
                        tickLine={false}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(20,25,31,0.04)' }}
                        contentStyle={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 12,
                          border: '1px solid #EDE9E0',
                          borderRadius: 6,
                          boxShadow: '0 4px 16px rgba(20,25,31,0.08)',
                        }}
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill={FOREST} radius={[0, 3, 3, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          )}

          <Card className="mt-6 overflow-hidden">
            <div className="flex items-baseline justify-between border-b border-ink-900/[0.08] px-6 py-4">
              <h2 className="font-display text-base font-semibold text-ink-900">Low stock products</h2>
              <span className="font-mono text-xs text-ink-400">
                threshold &le; {summary.low_stock_threshold} units
              </span>
            </div>
            {summary.low_stock_products.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-500">
                Nothing here yet &mdash; every product is well stocked.
              </p>
            ) : (
              <ul>
                {summary.low_stock_products.map((p) => (
                  <li key={p.id} className="ledger-row flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{p.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-ink-400">{p.sku}</p>
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

function StatCard({ label, value, to, index, flagged }) {
  return (
    <Link to={to} className="block animate-fade-up">
      <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[11px] text-ink-400">{index}</span>
          {flagged && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
        </div>
        <p className={`mt-3 font-display text-4xl font-semibold ${flagged ? 'text-signal-700' : 'text-ink-900'}`}>
          {value}
        </p>
        <p className="mt-1 text-sm text-ink-500">{label}</p>
        <div className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-signal transition-transform duration-200 group-hover:scale-x-100" />
      </Card>
    </Link>
  )
}

function ChartCard({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <Card className={`p-6 animate-fade-up ${className}`}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </Card>
  )
}

function ChartEmpty({ text }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-ink-900/10 bg-paper-dim/40">
      <p className="px-6 text-center text-sm text-ink-400">{text}</p>
    </div>
  )
}

function Legend({ items }) {
  return (
    <div className="mt-3 flex items-center gap-4">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-ink-500">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}