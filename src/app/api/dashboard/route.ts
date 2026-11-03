import { NextResponse } from 'next/server'
import { getSession } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const org = await prisma.organization.findUnique({ where: { id: session.orgId } })
  const products = await prisma.product.findMany({ where: { orgId: session.orgId } })

  const totalProducts = products.length
  const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0)
  const defaultThreshold = org?.defaultLowStockThreshold ?? 5

  const lowStockItems = products
    .map((p) => {
      const threshold = p.lowStockThreshold ?? defaultThreshold
      return { ...p, threshold, isLowStock: p.quantityOnHand <= threshold }
    })
    .filter((p) => p.isLowStock)
    .sort((a, b) => a.quantityOnHand - b.quantityOnHand)

  return NextResponse.json({
    organizationName: org?.name ?? 'Organization',
    totalProducts,
    totalQuantity,
    defaultThreshold,
    lowStockCount: lowStockItems.length,
    lowStockItems,
  })
}
