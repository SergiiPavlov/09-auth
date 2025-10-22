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

function createErrorResponse(error: unknown): NextResponse {
  if (isAxiosError(error) && error.response) {
    const response = NextResponse.json(error.response.data ?? null, {
      status: error.response.status,
    });
    appendSetCookie(response, error.response.headers['set-cookie']);
    return response;
  }

  return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
}

export async function POST() {
  try {
    const cookieHeader = cookies().toString();
    const upstream = await api.post(
      '/auth/logout',
      null,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      }
    );

    const response = new NextResponse(null, { status: upstream.status });
    appendSetCookie(response, upstream.headers['set-cookie']);
    return response;
  } catch (error) {
    return createErrorResponse(error);
  }
}
