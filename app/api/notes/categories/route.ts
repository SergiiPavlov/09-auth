import { NextRequest, NextResponse } from 'next/server';

function upstreamBase() {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  // fall back to same origin '/api' for local dev (if env is not provided)
  return base ? `${base}/api` : '/api';
}

export async function GET(req: NextRequest) {
  try {
    const url = `${upstreamBase()}/notes/categories`;
    const cookie = req.headers.get('cookie') || undefined;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || 'application/json';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();

    const nextRes = contentType.includes('application/json')
      ? NextResponse.json(body, { status: res.status })
      : new NextResponse(body as any, { status: res.status });

    // pass through Set-Cookie from upstream if present
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      // In Node runtime multiple cookies come as comma-joined; split conservatively
      const parts = setCookie.split(/,(?=[^;]+?=)/g);
      for (const c of parts) {
        nextRes.headers.append('Set-Cookie', c);
      }
    }

    return nextRes;
  } catch (err) {
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 500 });
  }
}
