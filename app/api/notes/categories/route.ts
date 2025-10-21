import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

function upstreamUrl(path: string) {
  if (!UPSTREAM) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return `${UPSTREAM}/api${path}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = upstreamUrl('/notes/categories');
    const cookie = req.headers.get('cookie') || undefined;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || 'application/json';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();

    const nextRes = contentType.includes('application/json')
      ? NextResponse.json(body, { status: res.status })
      : new NextResponse(body as any, { status: res.status });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      for (const c of setCookie.split(/,(?=[^;]+?=)/g)) nextRes.headers.append('Set-Cookie', c);
    }

    return nextRes;
  } catch (err) {
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 500 });
  }
}
