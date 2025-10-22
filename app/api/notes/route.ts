import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { api } from '../api';

function appendSetCookie(response: NextResponse, header?: string | string[]) {
  if (!header) {
    return;
  }

  const values = Array.isArray(header) ? header : [header];
  for (const value of values) {
    response.headers.append('Set-Cookie', value);
  }
}

function createErrorResponse(error: unknown): NextResponse {
  if (isAxiosError(error) && error.response) {
    const response = NextResponse.json(error.response.data, {
      status: error.response.status,
    });
    appendSetCookie(response, error.response.headers['set-cookie']);
    return response;
  }

  return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = cookies().toString();
    const searchParams = request.nextUrl.searchParams;
    const upstream = await api.get('/notes', {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      params: {
        search: searchParams.get('search') ?? undefined,
        page: searchParams.get('page') ?? undefined,
        perPage: searchParams.get('perPage') ?? undefined,
        tag: searchParams.get('tag') ?? undefined,
      },
    });

    const response = NextResponse.json(upstream.data, { status: upstream.status });
    appendSetCookie(response, upstream.headers['set-cookie']);
    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = cookies().toString();
    const body = await request.json();

    const upstream = await api.post('/notes', body, {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    const response = NextResponse.json(upstream.data, { status: upstream.status });
    appendSetCookie(response, upstream.headers['set-cookie']);
    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}
