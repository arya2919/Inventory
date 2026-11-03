'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type LowStockItem = {
  id: string
  name: string
  sku: string
  quantityOnHand: number
  threshold: number
}

type Dashboard = {
  organizationName: string
  totalProducts: number
  totalQuantity: number
  defaultThreshold: number
  lowStockCount: number
  lowStockItems: LowStockItem[]
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load dashboard')
        setData(json)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  if (!data) {
    return <p className="text-gray-500">Loading dashboard…</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Inventory snapshot for {data.organizationName}</p>
        </div>
        <Link
          href="/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Add product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card label="Total products" value={data.totalProducts} />
        <Card label="Units on hand" value={data.totalQuantity} />
        <Card label="Low stock items" value={data.lowStockCount} accent />
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Low stock items</h2>
          <p className="text-sm text-gray-500">
            Quantity on hand is at or below the product threshold (or org default of {data.defaultThreshold}).
          </p>
        </div>
        {data.lowStockItems.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-500">No low stock items. You are in good shape.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Quantity on hand</th>
                <th className="px-5 py-3 font-medium">Low stock threshold</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-5 py-3">
                    <Link href={`/products/${item.id}`} className="text-indigo-600 hover:underline font-medium">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{item.sku}</td>
                  <td className="px-5 py-3 font-medium text-red-600">{item.quantityOnHand}</td>
                  <td className="px-5 py-3 text-gray-600">{item.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Card({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? 'text-amber-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
