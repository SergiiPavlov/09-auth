import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { appendSetCookieHeaders, logErrorResponse, toUpstreamCookieHeader } from '../../_utils/utils';
import { serialize } from 'cookie';

function expireAuthCookies(response: NextResponse) {
  const cookieOptions = { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' as const };
  response.headers.append('Set-Cookie', serialize('accessToken', '', cookieOptions));
  response.headers.append('Set-Cookie', serialize('refreshToken', '', cookieOptions));
}

export async function POST() {
  try {
    const cookieStore = cookies();
    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const apiRes = await api.post('/auth/logout', null, {
      headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    });

    // Пробрасываем апстрим-куки, если они пришли
    const response = NextResponse.json(apiRes.data ?? { message: 'Logged out successfully' }, {
      status: apiRes.status ?? 200,
    });

    const upstreamCookies = apiRes.headers['set-cookie'];
    if (upstreamCookies && (Array.isArray(upstreamCookies) ? upstreamCookies.length > 0 : true)) {
      appendSetCookieHeaders(response, upstreamCookies);
    } else {
      // На некоторых ответах logout апстрима не шлёт Set-Cookie — чистим сами
      expireAuthCookies(response);
    }

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;

      // Формируем ответ и ВСЕГДА чистим токены, даже при 5xx
      const payload = status === 401 || status === 403
        ? { message: 'Already logged out' }
        : { error: error.message, response: error.response?.data };

      const response = NextResponse.json(payload, { status: status === 401 || status === 403 ? 200 : status });
      expireAuthCookies(response);
      return response;
    }

    // Нестандартная ошибка — всё равно чистим куки
    const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    expireAuthCookies(response);
    return response;
  }
}
