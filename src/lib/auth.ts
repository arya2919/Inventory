import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from './jwt'

export type { JWTPayload }
export { signToken } from './jwt'

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}
