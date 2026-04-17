import { NextRequest, NextResponse } from 'next/server';

const ROLE_REQUIRED: Record<string, string[]> = {
  '/dashboard': ['student', 'instructor', 'admin'],
  '/learn': ['student', 'instructor', 'admin'],
  '/billing': ['student', 'instructor', 'admin'],
  '/checkout': ['student', 'instructor', 'admin'],
  '/instructor': ['instructor', 'admin'],
  '/admin': ['admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('academy-role')?.value;

  for (const [prefix, allowed] of Object.entries(ROLE_REQUIRED)) {
    if (pathname.startsWith(prefix)) {
      if (!role || !allowed.includes(role)) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/billing/:path*',
    '/checkout/:path*',
    '/instructor/:path*',
    '/admin/:path*',
  ],
};
