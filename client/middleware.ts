import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for presence of either token in cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const hasToken = !!accessToken || !!refreshToken;

  const pathname = request.nextUrl.pathname;

  // Protected routes prefixes
  const isProtectedRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/teacher') || 
    pathname.startsWith('/student');

  // If trying to access a protected route without a token
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    // Optionally preserve the attempted URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access login/register, redirect them to home/dashboard
  if (hasToken && (pathname === '/login' || pathname === '/register')) {
    // Assuming a generic dashboard or let them go to root which might redirect them based on their role
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure the paths where this middleware should run
export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/login',
    '/register'
  ],
};
