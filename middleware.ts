import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers for Flutter app
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Basic seller route guard (cookie-based)
  if (pathname.startsWith('/seller')) {
    const role = request.cookies.get('userRole')?.value;
    const sellerId = request.cookies.get('sellerId')?.value;
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value;

    if (role !== 'seller' || !sellerId || isLoggedIn !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/register-seller';
      return NextResponse.redirect(url);
    }
  }

  // Basic admin route guard (cookie-based)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminAuth = request.cookies.get('adminAuth')?.value;
    if (adminAuth !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
