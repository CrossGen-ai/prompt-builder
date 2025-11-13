import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

// Protected routes that require authentication
const protectedRoutes = ['/']

// Public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Skip middleware for public auth routes
  const isPublicRoute = publicRoutes.includes(pathname)

  if (isPublicRoute) {
    // If authenticated user tries to access auth pages, redirect to home
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    // Allow access to public routes
    return NextResponse.next()
  }

  // Check if the current path is protected (exact match for / only)
  const isProtectedRoute = pathname === '/'

  // If it's a protected route and user is not authenticated, redirect to sign in
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
