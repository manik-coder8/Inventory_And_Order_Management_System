import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api/endpoints'
import { Card, Button, Input, EmptyState, Spinner, Alert } from '../components/ui'

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

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the people who place your orders.</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setFormErrors({}); setFormOpen(true) }}>
          + Add customer
        </Button>
      </header>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {successMsg && <div className="mb-4"><Alert tone="green">{successMsg}</Alert></div>}

      {formOpen && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Add a new customer</h2>
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
              <Button type="submit" disabled={submitting}>
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
        <div className="flex justify-center py-16 text-slate-400">
          <Spinner className="h-6 w-6" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer to start creating orders."
          action={<Button onClick={() => setFormOpen(true)}>+ Add customer</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.full_name}</td>
                  <td className="px-5 py-3 text-slate-500">{c.email}</td>
                  <td className="px-5 py-3 text-slate-500">{c.phone_number}</td>
                  <td className="px-5 py-3 text-right">
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
