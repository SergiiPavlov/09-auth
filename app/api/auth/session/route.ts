import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { api } from '../../api';

function appendSetCookie(response: NextResponse, header?: string | string[]) {
  if (!header) {
    return;
  }

  const values = Array.isArray(header) ? header : [header];
  for (const value of values) {
    response.headers.append('Set-Cookie', value);
  }
}

export async function GET() {
  try {
    const cookieHeader = cookies().toString();
    const upstream = await api.get('/auth/session', {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    const payload = upstream.data;
    const response =
      payload && Object.keys(payload as Record<string, unknown>).length > 0
        ? NextResponse.json(payload, { status: upstream.status })
        : new NextResponse(null, { status: upstream.status });
    appendSetCookie(response, upstream.headers['set-cookie']);
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const payload = error.response.data;
      const response =
        payload && Object.keys(payload as Record<string, unknown>).length > 0
          ? NextResponse.json(payload, { status: error.response.status })
          : new NextResponse(null, { status: error.response.status });
      appendSetCookie(response, error.response.headers['set-cookie']);
      return response;
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
