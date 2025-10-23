import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];
const PRIVATE_PREFIXES = ['/profile', '/notes'];

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  let isAuth = Boolean(accessToken);
  let sessionCookies: string[] = [];

  if (!isAuth && refreshToken) {
    try {
      const sessionResponse = await fetch(`${origin}/api/auth/session`, {
        method: 'GET',
        headers: { cookie: req.headers.get('cookie') || '' },
      });

      if (sessionResponse.ok) {
        isAuth = true;

        const headers = sessionResponse.headers as Headers & {
          getSetCookie?: () => string[];
        };

        sessionCookies = headers.getSetCookie?.() ?? [];

        if (!sessionCookies.length) {
          const cookieHeader = headers.get('set-cookie');

          if (cookieHeader) {
            sessionCookies = [cookieHeader];
          }
        }
      }
    } catch (error) {
      // ignore refresh errors
    }
  }

  const isPrivateRoute = PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  let response: NextResponse;

  if (isPrivateRoute && !isAuth) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    response = NextResponse.redirect(url);
  } else if (isAuth && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/profile';
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  sessionCookies.forEach((cookie) => {
    response.headers.append('set-cookie', cookie);
  });

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
