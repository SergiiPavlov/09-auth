import { NextRequest, NextResponse } from 'next/server';
import {
  buildNotehubUrl,
  createNotehubHeaders,
  handleNotehubProxyError,
  relayNotehubResponse,
} from '../utils';
import { getMockNotes } from '../mock-data';

export async function GET(req: NextRequest) {
  const url = buildNotehubUrl('/notes', req.nextUrl.searchParams);

  try {
    const response = await fetch(url, {
      headers: createNotehubHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    return await relayNotehubResponse(response);
  } catch (error) {
    console.warn('[notehub] Falling back to mock notes data.', error);

    const searchParams = req.nextUrl.searchParams;
    const fallback = getMockNotes({
      page: Number(searchParams.get('page') ?? undefined),
      perPage: Number(searchParams.get('perPage') ?? undefined),
      search: searchParams.get('search'),
      tag: searchParams.get('tag'),
    });

    return NextResponse.json(fallback, {
      status: 200,
      headers: { 'x-notehub-mock': '1' },
    });
  }
}

export async function POST(req: NextRequest) {
  const url = buildNotehubUrl('/notes');
  const body = await req.text();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createNotehubHeaders({ 'content-type': 'application/json' }),
      body,
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}
