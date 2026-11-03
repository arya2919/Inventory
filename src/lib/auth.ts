import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from '@/lib/jwt'

export type { JWTPayload }
export { signToken } from '@/lib/jwt'

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}
