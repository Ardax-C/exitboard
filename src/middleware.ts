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
  '/_next',
  '/static',
  '/favicon.ico',
  '/images',
  '/assets'
]

// Define protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/admin',
  '/post',
  '/post-job',
  '/api/admin',
  '/api/users',
  '/api/jobs/create'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and static files
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))
  if (!requiresAuth) {
    return NextResponse.next()
  }

  // Get token from Authorization header or cookie
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')

    // Forward the token to API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('authorization', `Bearer ${token}`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // If token is invalid, clear it and redirect to login
    const response = pathname.startsWith('/api/')
      ? new NextResponse('Unauthorized', { status: 401 })
      : NextResponse.redirect(new URL('/auth/signin', request.url))

    response.cookies.delete('token')
    return response
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 