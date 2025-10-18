import { NextResponse } from 'next/server';

const NOTEHUB_API_BASE = process.env.NOTEHUB_API_BASE?.trim() || 'https://goit-notehub.ivariv.dev';
const NOTEHUB_TOKEN = process.env.NOTEHUB_TOKEN ?? process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? '';

function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildNotehubUrl(path: string, searchParams?: URLSearchParams): URL {
  const url = new URL(ensureLeadingSlash(path), NOTEHUB_API_BASE);
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  return url;
}

export function createNotehubHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('Accept', 'application/json');
  if (NOTEHUB_TOKEN) {
    headers.set('Authorization', `Bearer ${NOTEHUB_TOKEN}`);
  }
  return headers;
}

export async function relayNotehubResponse(response: Response): Promise<NextResponse> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  const text = await response.text();
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['content-type'] = contentType;
  }

  return new NextResponse(text, {
    status: response.status,
    headers,
  });
}

export function handleNotehubProxyError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json(
    { message: `Failed to contact NoteHub API. ${message}` },
    { status: 502 }
  );
}
