import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/onboarding'];

// Routes that are strictly for "Pro" users
const PRO_ROUTES = ['/dashboard/workouts/new', '/dashboard/analytics'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;
  const userPlan = request.cookies.get('userPlan')?.value || 'free';

  // 1. Check for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Store intended destination to redirect back after login
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Check for Pro routes
  const isProRoute = PRO_ROUTES.some(route => pathname.startsWith(route));
  
  if (isProRoute && userPlan !== 'pro') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard'; // Or a pricing page
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

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
};
