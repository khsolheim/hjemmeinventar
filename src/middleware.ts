// Middleware for route protection
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/items',
  '/locations',
  '/categories',
  '/settings'
]

// Routes that should be accessible without authentication  
const publicRoutes = [
  '/',
  '/test',
  '/auth/signin',
  '/auth/signup'
]

// tRPC routes that should be public (no authentication required)
const publicTrpcRoutes = [
  '/api/trpc/users.register',
  '/api/trpc/users.test'
]

// Auth routes that should redirect if already authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public tRPC routes without authentication
  const isPublicTrpcRoute = publicTrpcRoutes.some(route => 
    pathname === route
  )
  
  // Allow public routes without authentication
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  )
  
  if (isPublicTrpcRoute || isPublicRoute) {
    return NextResponse.next()
  }
  
  // Get the session using NextAuth
  const session = await auth()
  const isAuthenticated = !!session?.user
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if this is a tRPC route that requires authentication
  const isProtectedTrpcRoute = pathname.startsWith('/api/trpc') && !isPublicTrpcRoute
  
  // Check if this is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Redirect unauthenticated users away from protected routes
  if ((isProtectedRoute || isProtectedTrpcRoute) && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // Redirect authenticated users away from auth routes (only if they're not already on a public route)
  if (isAuthRoute && isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - workbox (workbox files)
     * - manifest.json (PWA manifest)
     * - public folder
     * - api/ping (health check)
     */
    '/((?!api/auth|api/ping|_next/static|_next/image|favicon.ico|sw.js|workbox|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
