import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { AccountStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as { userId: string }

    // Get user and check status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        status: true,
        tokenInvalidatedAt: true,
      },
    })

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is deactivated
    if (user.status === AccountStatus.DEACTIVATED) {
      return new NextResponse('Account deactivated', { status: 403 })
    }

    // Check if token was invalidated
    if (user.tokenInvalidatedAt) {
      const tokenIssuedAt = new Date((decoded as any).iat * 1000)
      if (tokenIssuedAt < user.tokenInvalidatedAt) {
        return new NextResponse('Session expired', { status: 401 })
      }
    }

    return NextResponse.next()
  } catch (error) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /auth/* (auth pages)
     * 4. /static/* (static files)
     * 5. /*.* (files with extensions)
     */
    '/((?!api/auth|_next|auth|static|[\\w-]+\\.\\w+).*)',
  ],
} 