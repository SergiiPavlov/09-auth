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

    // Нет токенов — нет смысла дергать апстрим.
    if (!accessToken && !refreshToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const cookieHeader = toUpstreamCookieHeader(cookieStore);
    const upstream = await api.get('/auth/session', {
      headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    });

    const res = NextResponse.json(upstream.data ?? { user: null }, { status: upstream.status || 200 });

    // Типобезопасно достаём Set-Cookie и прокидываем клиенту
    const setCookie = (upstream.headers as Record<string, unknown>)['set-cookie'] as
      | string
      | string[]
      | undefined;
    appendSetCookieHeaders(res, setCookie);

    return res;
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json({ user: null }, { status: 200 });
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
