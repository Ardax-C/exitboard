import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

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
    // Only verify the token's validity and expiration
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')

    // Add the token to the request headers for API routes to use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-verified-token', token)

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
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