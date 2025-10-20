import { NextRequest, NextResponse } from 'next/server';
import { api } from '../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { appendSetCookieHeaders, logErrorResponse, toUpstreamCookieHeader } from '../_utils/utils';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const search = request.nextUrl.searchParams.get('search')?.trim() ?? '';
    const pageParam = Number(request.nextUrl.searchParams.get('page') ?? 1);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const perPageParam = request.nextUrl.searchParams.get('perPage');
    const perPageRaw = Number(perPageParam ?? 12);
    const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? perPageRaw : 12;
    const rawTag = request.nextUrl.searchParams.get('tag') ?? '';
    const tag = rawTag === 'All' ? '' : rawTag;

    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const res = await api.get('/notes', {
      params: {
        page,
        perPage,
        ...(search && { search }),
        ...(tag && { tag }),
      },
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    const response = NextResponse.json(res.data, { status: res.status });
    appendSetCookieHeaders(response, res.headers['set-cookie']);
    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status ?? 500 },
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const body = await request.json();

    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const res = await api.post('/notes', body, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    const response = NextResponse.json(res.data, { status: res.status });
    appendSetCookieHeaders(response, res.headers['set-cookie']);
    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status ?? 500 },
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
