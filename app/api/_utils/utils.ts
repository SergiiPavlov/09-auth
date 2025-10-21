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

export function normalizeSetCookieHeader(value: string): string {
  // Guarantee visibility of auth cookies on all app routes:
  // - Force Path=/
  // - Drop Domain (host-only cookie is OK for SPA/front routes)
  const parts = value.split(';').map(p => p.trim());
  if (parts.length === 0) return value;

  const [nameValue, ...attrs] = parts;
  const kept: string[] = [];
  let hasPath = false;

  for (const raw of attrs) {
    const [k] = raw.split('=');
    const key = (k || '').trim().toLowerCase();
    if (key === 'path') {
      hasPath = true;
      kept.push('Path=/');
      continue;
    }
    if (key === 'domain') {
      // Remove Domain so cookie applies to the current host only
      continue;
    }
    kept.push(raw);
  }
  if (!hasPath) kept.push('Path=/');

  return [nameValue, ...kept].join('; ');
}

export function appendSetCookieHeaders(response: NextResponse, setCookie: SetCookieHeader): void {
  if (!setCookie) return;
  const values = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const value of values) {
    if (!value) continue;
    const normalized = normalizeSetCookieHeader(value);
    response.headers.append('Set-Cookie', normalized);
  }
}

export function toUpstreamCookieHeader(cookieStore: CookieLike): string | undefined {
  const serialized = cookieStore.toString();
  return serialized.length > 0 ? serialized : undefined;
}
