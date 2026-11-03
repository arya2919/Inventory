import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findFirst({ where: { id: params.id, orgId: session.orgId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(product)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findFirst({ where: { id: params.id, orgId: session.orgId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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

    const nextSku = String(sku).trim()
    if (nextSku !== product.sku) {
      const existing = await prisma.product.findFirst({
        where: { orgId: session.orgId, sku: nextSku, NOT: { id: product.id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'SKU already exists in your organization' }, { status: 400 })
      }
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: String(name).trim(),
        sku: nextSku,
        description: description ? String(description).trim() : null,
        quantityOnHand: qty,
        costPrice: parseOptionalFloat(costPrice),
        sellingPrice: parseOptionalFloat(sellingPrice),
        lowStockThreshold: parseOptionalInt(lowStockThreshold),
        lastUpdatedBy: session.email,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findFirst({ where: { id: params.id, orgId: session.orgId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.product.delete({ where: { id: product.id } })
  return NextResponse.json({ success: true })
}
