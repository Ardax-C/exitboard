import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const authResult = await verifyAuth(token)

  if (!authResult.isValid) {
    return new NextResponse(authResult.error, { status: 401 })
  }

  return NextResponse.json({ status: 'active' })
} 