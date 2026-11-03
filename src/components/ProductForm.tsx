'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export type ProductFormValues = {
  name: string
  sku: string
  description: string
  quantityOnHand: string
  costPrice: string
  sellingPrice: string
  lowStockThreshold: string
}

const empty: ProductFormValues = {
  name: '',
  sku: '',
  description: '',
  quantityOnHand: '0',
  costPrice: '',
  sellingPrice: '',
  lowStockThreshold: '',
}

export default function ProductForm({
  productId,
  initial,
}: {
  productId?: string
  initial?: Partial<ProductFormValues>
}) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormValues>({ ...empty, ...initial })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: keyof ProductFormValues, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
      method: productId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Save failed')
      return
    }

    router.push('/products')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 max-w-2xl">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Field label="Name" required>
        <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
      </Field>
      <Field label="SKU" required>
        <input required value={form.sku} onChange={(e) => set('sku', e.target.value)} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className={inputClass} rows={3} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Quantity on hand" required>
          <input
            required
            type="number"
            min={0}
            value={form.quantityOnHand}
            onChange={(e) => set('quantityOnHand', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Low stock threshold">
          <input
            type="number"
            min={0}
            value={form.lowStockThreshold}
            onChange={(e) => set('lowStockThreshold', e.target.value)}
            className={inputClass}
            placeholder="Uses org default if empty"
          />
        </Field>
        <Field label="Cost price">
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.costPrice}
            onChange={(e) => set('costPrice', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Selling price">
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.sellingPrice}
            onChange={(e) => set('sellingPrice', e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : productId ? 'Save changes' : 'Create product'}
        </button>
        <Link href="/products" className="px-4 py-2.5 rounded-lg text-sm border border-gray-300 text-gray-700">
          Cancel
        </Link>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
