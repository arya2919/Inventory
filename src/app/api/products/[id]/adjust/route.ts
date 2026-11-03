import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findFirst({ where: { id: params.id, orgId: session.orgId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const delta = parseInt(String(body.adjustment), 10)
  if (!Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: 'Enter a non-zero adjustment (e.g. 5 or -3)' }, { status: 400 })
  }

  const newQty = Math.max(0, product.quantityOnHand + delta)
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      quantityOnHand: newQty,
      lastUpdatedBy: session.email,
    },
  })

  return NextResponse.json(updated)
}
