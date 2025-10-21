import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { appendSetCookieHeaders, logErrorResponse, toUpstreamCookieHeader } from '../../_utils/utils';
import { serialize } from 'cookie';

export async function POST() {
  try {
    const cookieStore = cookies();
    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const apiRes = await api.post('/auth/logout', null, {
      headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    });

    const response = NextResponse.json(apiRes.data ?? { message: 'Logged out successfully' }, {
      status: apiRes.status ?? 200,
    });

    const upstreamCookies = apiRes.headers['set-cookie'];
    if (upstreamCookies && (Array.isArray(upstreamCookies) ? upstreamCookies.length > 0 : true)) {
      appendSetCookieHeaders(response, upstreamCookies);
    } else {
      const cookieOptions = { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' as const };
      response.headers.append('Set-Cookie', serialize('accessToken', '', cookieOptions));
      response.headers.append('Set-Cookie', serialize('refreshToken', '', cookieOptions));
    }

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;

      // Уже разлогинен? Считаем это успешным выходом.
      if (status === 401 || status === 403) {
        const response = NextResponse.json({ message: 'Already logged out' }, { status: 200 });
        const cookieOptions = { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' as const };
        response.headers.append('Set-Cookie', serialize('accessToken', '', cookieOptions));
        response.headers.append('Set-Cookie', serialize('refreshToken', '', cookieOptions));
        return response;
      }

      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
