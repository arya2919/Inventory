'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  sku: string
  quantityOnHand: number
  sellingPrice: number | null
  threshold: number
  isLowStock: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [adjustments, setAdjustments] = useState<Record<string, string>>({})

  const load = async (q = search) => {
    setLoading(true)
    const res = await fetch(`/api/products${q ? `?search=${encodeURIComponent(q)}` : ''}`)
    const json = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(json.error || 'Failed to load products')
      return
    }
    setError('')
    setProducts(json.products)
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    load(search)
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete product “${name}”? This cannot be undone.`)) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      setError(json.error || 'Delete failed')
      return
    }
    load()
  }

  const adjust = async (id: string) => {
    const value = adjustments[id]
    const res = await fetch(`/api/products/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment: value }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Adjustment failed')
      return
    }
    setAdjustments((prev) => ({ ...prev, [id]: '' }))
    load()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Create, edit, and adjust stock for your organization.</p>
        </div>
        <Link
          href="/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 text-center"
        >
          Add product
        </Link>
      </div>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50">
          Search
        </button>
      </form>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="px-5 py-10 text-sm text-gray-500">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500">No products yet. Add your first SKU to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Quantity</th>
                  <th className="px-5 py-3 font-medium">Low stock</th>
                  <th className="px-5 py-3 font-medium">Selling price</th>
                  <th className="px-5 py-3 font-medium">Adjust</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 align-middle">
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/products/${p.id}`} className="text-indigo-600 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.sku}</td>
                    <td className="px-5 py-3">{p.quantityOnHand}</td>
                    <td className="px-5 py-3">
                      {p.isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          Low ({p.threshold})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {p.sellingPrice === null ? '—' : `$${Number(p.sellingPrice).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <input
                          value={adjustments[p.id] ?? ''}
                          onChange={(e) => setAdjustments((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="+/- N"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={() => adjust(p.id)}
                          className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                          Apply
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link href={`/products/${p.id}`} className="text-indigo-600 hover:underline mr-3">
                        Edit
                      </Link>
                      <button onClick={() => remove(p.id, p.name)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
