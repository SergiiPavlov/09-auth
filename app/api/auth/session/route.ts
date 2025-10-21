import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '../../api';
import { isAxiosError } from 'axios';
import {
  appendSetCookieHeaders,
  logErrorResponse,
  toUpstreamCookieHeader,
} from '../../_utils/utils';

type UnknownRecord = Record<string, unknown>;

function pickUserFromPayload(payload: unknown): UnknownRecord | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const picked = pickUserFromPayload(item);
      if (picked) {
        return picked;
      }
    }
    return null;
  }

  const data = payload as UnknownRecord;

  if (data.user) {
    const nested = pickUserFromPayload(data.user);
    if (nested) {
      return nested;
    }
  }

  if (data.data) {
    const nested = pickUserFromPayload(data.data);
    if (nested) {
      return nested;
    }
  }

  if (typeof data.email === 'string') {
    return data;
  }

  return null;
}

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

    const user = pickUserFromPayload(apiRes.data);
    const responsePayload = user ? { user } : null;
    const response = NextResponse.json(responsePayload, { status: apiRes.status });
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
