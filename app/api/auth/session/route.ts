import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '../../api';
import { isAxiosError } from 'axios';
import { appendSetCookieHeaders, logErrorResponse, toUpstreamCookieHeader } from '../../_utils/utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(null, { status: 200 });
    }

    const cookieHeader = toUpstreamCookieHeader(cookieStore);
    const apiRes = await api.get('/auth/session', {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    const responseBody = apiRes.data ?? null;
    const response = NextResponse.json(responseBody, { status: apiRes.status });
    appendSetCookieHeaders(response, apiRes.headers['set-cookie']);
    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return NextResponse.json(null, { status: 200 });
      }
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status ?? 500 },
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
