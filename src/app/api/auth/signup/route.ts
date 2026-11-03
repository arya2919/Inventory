import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, organizationName } = await request.json()

    if (!email || !password || !organizationName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const org = await prisma.organization.create({
      data: { name: String(organizationName).trim() },
    })

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        orgId: org.id,
      },
    })

    const token = await signToken({ userId: user.id, orgId: org.id, email: user.email })

    const response = NextResponse.json({ success: true })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
