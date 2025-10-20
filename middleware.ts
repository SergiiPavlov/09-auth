import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_AUTH = ['/sign-in', '/sign-up'];
const PRIVATE_PREFIX = ['/profile', '/notes'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip assets and API routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // Check cookie set by backend (proxied through our app/api/*)
  const isAuthed = Boolean(req.cookies.get('accessToken')?.value);

  const isPublicAuth = PUBLIC_AUTH.includes(pathname);
  const isPrivate = PRIVATE_PREFIX.some((p) => pathname.startsWith(p));

  // Block private routes for guests
  if (isPrivate && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Block auth pages for authed users
  if (isPublicAuth && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = '/profile';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)'],
};
