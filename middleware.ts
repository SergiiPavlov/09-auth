import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
const AUTH_ROUTES = ['/sign-in', '/sign-up'];
const PRIVATE_PREFIXES = ['/profile', '/notes'];
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;
  let isAuth = Boolean(accessToken);
  if (!isAuth && refreshToken) {
    try {
      const resp = await fetch(`${origin}/api/auth/session`, { method: 'GET', headers: { cookie: req.headers.get('cookie') || '' } });
      if (resp.ok) isAuth = true;
    } catch {}
  }
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isPrivate && !isAuth) { const url = req.nextUrl.clone(); url.pathname = '/sign-in'; return NextResponse.redirect(url); }
  if (isAuth && isAuthRoute) { const url = req.nextUrl.clone(); url.pathname = '/profile'; return NextResponse.redirect(url); }
  return NextResponse.next();
}
export const config = { matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'] };
