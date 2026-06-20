import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api/endpoints'
import { Card, Button, Input, EmptyState, Spinner, Alert, SectionEyebrow } from '../components/ui'

const emptyForm = { full_name: '', email: '', phone_number: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const loadCustomers = () => {
    setLoading(true)
    getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadCustomers, [])

  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (!form.phone_number.trim()) errs.phone_number = 'Phone number is required.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setError('')
    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      })
      setSuccessMsg('Customer added.')
      setForm(emptyForm)
      setFormOpen(false)
      loadCustomers()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (customer) => {
    if (!confirm(`Delete "${customer.full_name}"? This cannot be undone.`)) return
    setError('')
    try {
      await deleteCustomer(customer.id)
      setSuccessMsg('Customer deleted.')
      loadCustomers()
    } catch (e) {
      setError(e.message)
    }
  }

  const initials = (name) =>
    name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <SectionEyebrow>Contacts</SectionEyebrow>
          <h1 className="mt-1.5 font-display text-3xl font-semibold text-ink-900">Customers</h1>
          <p className="mt-1.5 text-sm text-ink-500">Manage the people who place your orders.</p>
        </div>
        <Button
          variant="signal"
          onClick={() => { setForm(emptyForm); setFormErrors({}); setFormOpen(true) }}
        >
          + Add customer
        </Button>
      </header>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {successMsg && <div className="mb-4"><Alert tone="green">{successMsg}</Alert></div>}

      {formOpen && (
        <Card className="mb-6 p-6 animate-fade-up">
          <h2 className="mb-5 font-display text-lg font-semibold text-ink-900">Add a new customer</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              error={formErrors.full_name}
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={formErrors.email}
            />
            <Input
              label="Phone number"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              error={formErrors.phone_number}
            />
            <div className="flex gap-3 sm:col-span-3">
              <Button type="submit" variant="signal" disabled={submitting}>
                {submitting && <Spinner className="h-4 w-4" />}
                Add customer
              </Button>
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-ink-400">
          <Spinner className="h-6 w-6" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer to start creating orders."
          action={<Button variant="signal" onClick={() => setFormOpen(true)}>+ Add customer</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-900/[0.08] bg-paper-dim/60 text-left">
              <tr>
                <th className="px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-ink-400">Customer</th>
                <th className="px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-ink-400">Email</th>
                <th className="px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-ink-400">Phone</th>
                <th className="px-6 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-wide text-ink-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="ledger-row transition-colors hover:bg-paper-dim/40">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-[11px] font-medium text-paper">
                        {initials(c.full_name) || '–'}
                      </span>
                      <span className="font-medium text-ink-900">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-ink-500">{c.email}</td>
                  <td className="px-6 py-3.5 font-mono text-ink-500">{c.phone_number}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Button variant="danger" className="px-2.5 py-1" onClick={() => handleDelete(c)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}