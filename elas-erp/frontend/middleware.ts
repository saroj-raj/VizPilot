import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/'

  // Get Supabase auth tokens from cookies
  const supabaseAuth = request.cookies.get('sb-nkohcnqkjjsjludqmkjz-auth-token')?.value || 
                       request.cookies.get('supabase-auth-token')?.value ||
                       ''

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !supabaseAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login/signup with valid token
  if (isPublicPath && supabaseAuth && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
