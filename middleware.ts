import { type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Get the pathname
  const pathname = request.nextUrl.pathname

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/role-selection',
  ]

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If it's a public route, allow access
  if (isPublicRoute) {
    return response
  }

  // For all other routes, the updateSession function will handle authentication
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
