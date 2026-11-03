import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const org = await prisma.organization.findUnique({ where: { id: session.orgId } })
  return NextResponse.json({
    organizationName: org?.name ?? 'Organization',
    defaultLowStockThreshold: org?.defaultLowStockThreshold ?? 5,
  })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { defaultLowStockThreshold } = await request.json()
  const value = parseInt(String(defaultLowStockThreshold), 10)
  if (!Number.isFinite(value) || value < 0) {
    return NextResponse.json({ error: 'Invalid threshold value' }, { status: 400 })
  }

  const org = await prisma.organization.update({
    where: { id: session.orgId },
    data: { defaultLowStockThreshold: value },
  })

  return NextResponse.json({ defaultLowStockThreshold: org.defaultLowStockThreshold })
}
