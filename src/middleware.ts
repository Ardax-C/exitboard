import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/jobs',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/verify-credentials',
]

export async function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.[a-zA-Z0-9]+$/) // Files with extensions
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  // If no token and not a public path, redirect to login
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')

    // Forward the token to the API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('authorization', `Bearer ${token}`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // If token is invalid and it's an API route, return 401
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    // For non-API routes, redirect to login
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /_vercel (Vercel internals)
     * 4. /favicon.ico, etc. (asset files)
     */
    '/((?!_next|static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
} 