export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { appendSetCookieHeaders, logErrorResponse, toUpstreamCookieHeader } from '../../_utils/utils';
import { isAxiosError } from 'axios';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const res = await api.get('/users/me', {
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

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const res = await api.patch('/users/me', body, {
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
