import { jwtVerify } from 'jose'

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    )
    return { userId: payload.userId as string }
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
} 