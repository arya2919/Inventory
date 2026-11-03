import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const publicPaths = ['/login', '/signup']
  const token = request.cookies.get('token')?.value
  const session = token ? await verifyToken(token) : null

  if (publicPaths.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
