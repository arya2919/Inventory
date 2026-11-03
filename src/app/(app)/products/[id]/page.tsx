'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductForm from '../../../../components/ProductForm'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<null | {
    name: string
    sku: string
    description: string | null
    quantityOnHand: number
    costPrice: number | null
    sellingPrice: number | null
    lowStockThreshold: number | null
    lastUpdatedBy: string | null
    updatedAt: string
  }>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Not found')
        setProduct(json)
      })
      .catch((err) => setError(err.message))
  }, [params.id])

  if (error) return <p className="text-red-600">{error}</p>
  if (!product) return <p className="text-gray-500">Loading product…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit product</h1>
      <p className="text-sm text-gray-500 mb-6">
        Last updated {new Date(product.updatedAt).toLocaleString()}
        {product.lastUpdatedBy ? ` by ${product.lastUpdatedBy}` : ''}
      </p>
      <ProductForm
        productId={params.id}
        initial={{
          name: product.name,
          sku: product.sku,
          description: product.description ?? '',
          quantityOnHand: String(product.quantityOnHand),
          costPrice: product.costPrice === null ? '' : String(product.costPrice),
          sellingPrice: product.sellingPrice === null ? '' : String(product.sellingPrice),
          lowStockThreshold: product.lowStockThreshold === null ? '' : String(product.lowStockThreshold),
        }}
      />
    </div>
  )
}
