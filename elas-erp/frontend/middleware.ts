import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED FOR DEBUGGING
  console.log('Middleware: Disabled, allowing all requests through')
  return NextResponse.next()
  
  /* // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/'

  // Get Supabase auth tokens from cookies
  // Supabase uses a cookie with the project ref in the name
  const cookies = request.cookies.getAll()
  console.log('Middleware: All cookies:', cookies.map(c => c.name))
  
  const supabaseAuth = request.cookies.get('sb-nkohcnqkjjsjludqmkjz-auth-token')?.value || 
                       request.cookies.get('sb-nkohcnqkjjsjludqmkjz-auth-token-code-verifier')?.value ||
                       ''
  
  console.log('Middleware: Path:', path, 'Has auth:', !!supabaseAuth, 'Is public:', isPublicPath)

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !supabaseAuth) {
    console.log('Middleware: Redirecting to login (no auth)')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login/signup with valid token
  if (isPublicPath && supabaseAuth && path !== '/') {
    console.log('Middleware: Redirecting to dashboard (authenticated user on public page)')
    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
  }

  console.log('Middleware: Allowing through')
  return NextResponse.next() */
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
