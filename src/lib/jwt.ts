import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'stockflow-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  orgId: string
  email: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, orgId: payload.orgId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (!payload.userId || !payload.orgId || !payload.email) return null
    return {
      userId: String(payload.userId),
      orgId: String(payload.orgId),
      email: String(payload.email),
    }
  } catch {
    return null
  }
}
