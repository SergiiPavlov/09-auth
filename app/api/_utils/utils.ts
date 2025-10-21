import type { NextResponse } from 'next/server';

export function logErrorResponse(errorObj: unknown): void {
  if (process.env.NODE_ENV === 'production') return;
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';

  // Стрелка зелёная, текст жёлтый
  console.log(`${green}> ${yellow}Error Response Data:${reset}`);
  console.dir(errorObj, { depth: null, colors: true });
}

type CookieLike = { toString(): string };

export type SetCookieHeader = string | string[] | undefined;

export function appendSetCookieHeaders(
  response: NextResponse,
  setCookie: SetCookieHeader,
): void {
  if (!setCookie) return;

  const values = Array.isArray(setCookie) ? setCookie : [setCookie];

  for (const value of values) {
    if (!value) continue;
    response.headers.append('Set-Cookie', value);
  }
}

export function toUpstreamCookieHeader(cookieStore: CookieLike): string | undefined {
  const serialized = cookieStore.toString();
  return serialized.length > 0 ? serialized : undefined;
}
