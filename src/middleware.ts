import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/jobs',
  '/api/jobs',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/verify-credentials',
  '/api/auth/me',
]

// Define protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/admin',
  '/post-job',
  '/api/admin',
  '/api/users',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicRoutes.some(route => pathname === route) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.[a-zA-Z0-9]+$/) // Files with extensions

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if the path requires authentication
  const isProtectedPath = protectedRoutes.some(route => pathname.startsWith(route))

  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : request.cookies.get('token')?.value

  // If accessing a protected route without a token, redirect to login
  if (isProtectedPath && !token) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const searchParams = new URLSearchParams({ callbackUrl: pathname })
    return NextResponse.redirect(new URL(`/auth/signin?${searchParams}`, request.url))
  }

  try {
    if (token) {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')

      // Forward the token to the API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('authorization', `Bearer ${token}`)

      // Create response
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      return response
    }

    // For non-protected routes without token, allow access
    return NextResponse.next()
  } catch (error) {
    // If token is invalid
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    // For non-API routes, redirect to login with callback URL
    const searchParams = new URLSearchParams({ callbackUrl: pathname })
    return NextResponse.redirect(new URL(`/auth/signin?${searchParams}`, request.url))
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