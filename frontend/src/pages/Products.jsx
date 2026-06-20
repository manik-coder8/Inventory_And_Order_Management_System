import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/endpoints'
import { Card, Button, Badge, Input, EmptyState, Spinner, Alert } from '../components/ui'

const emptyForm = { name: '', sku: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const loadProducts = () => {
    setLoading(true)
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadProducts, [])

  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormErrors({})
    setFormOpen(true)
  }

  const openEditForm = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity),
    })
    setFormErrors({})
    setFormOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required.'
    if (!form.sku.trim()) errs.sku = 'SKU is required.'
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Enter a valid, non-negative price.'
    if (form.quantity === '' || Number(form.quantity) < 0 || !Number.isInteger(Number(form.quantity)))
      errs.quantity = 'Enter a valid, non-negative whole number.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setSuccessMsg('Product updated.')
      } else {
        await createProduct(payload)
        setSuccessMsg('Product added.')
      }
      setFormOpen(false)
      loadProducts()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await deleteProduct(product.id)
      setSuccessMsg('Product deleted.')
      loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your catalog and stock levels.</p>
        </div>
        <Button onClick={openCreateForm}>+ Add product</Button>
      </header>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {successMsg && <div className="mb-4"><Alert tone="green">{successMsg}</Alert></div>}

      {formOpen && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            {editingId ? 'Edit product' : 'Add a new product'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="SKU / code"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              error={formErrors.sku}
            />
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={formErrors.price}
            />
            <Input
              label="Quantity in stock"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              error={formErrors.quantity}
            />
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting && <Spinner className="h-4 w-4" />}
                {editingId ? 'Save changes' : 'Add product'}
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
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start tracking inventory."
          action={<Button onClick={openCreateForm}>+ Add product</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3 text-slate-500">{p.sku}</td>
                  <td className="px-5 py-3 text-slate-700">${Number(p.price).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.quantity === 0 ? 'red' : p.quantity <= 10 ? 'amber' : 'green'}>
                      {p.quantity}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" className="px-2.5 py-1" onClick={() => openEditForm(p)}>
                        Edit
                      </Button>
                      <Button variant="danger" className="px-2.5 py-1" onClick={() => handleDelete(p)}>
                        Delete
                      </Button>
                    </div>
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
