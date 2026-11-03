import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

function parseOptionalFloat(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : null
}

function parseOptionalInt(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const n = parseInt(String(value), 10)
  return Number.isFinite(n) ? n : null
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() || ''

  const org = await prisma.organization.findUnique({ where: { id: session.orgId } })
  const defaultThreshold = org?.defaultLowStockThreshold ?? 5

  const products = await prisma.product.findMany({
    where: {
      orgId: session.orgId,
      ...(search
        ? {
            OR: [{ name: { contains: search } }, { sku: { contains: search } }],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    defaultThreshold,
    products: products.map((p) => {
      const threshold = p.lowStockThreshold ?? defaultThreshold
      return { ...p, threshold, isLowStock: p.quantityOnHand <= threshold }
    }),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = body

    if (!name || !sku) {
      return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 })
    }

    const qty = parseInt(String(quantityOnHand ?? 0), 10)
    if (!Number.isFinite(qty) || qty < 0) {
      return NextResponse.json({ error: 'Quantity must be a non-negative integer' }, { status: 400 })
    }

    const existing = await prisma.product.findFirst({
      where: { orgId: session.orgId, sku: String(sku).trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'SKU already exists in your organization' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        orgId: session.orgId,
        name: String(name).trim(),
        sku: String(sku).trim(),
        description: description ? String(description).trim() : null,
        quantityOnHand: qty,
        costPrice: parseOptionalFloat(costPrice),
        sellingPrice: parseOptionalFloat(sellingPrice),
        lowStockThreshold: parseOptionalInt(lowStockThreshold),
        lastUpdatedBy: session.email,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
