export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { appendSetCookieHeaders, logErrorResponse, toUpstreamCookieHeader } from '../../_utils/utils';
import { isAxiosError } from 'axios';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;
    const cookieHeader = toUpstreamCookieHeader(cookieStore);
    const res = await api.get(`/notes/${id}`, {
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

export async function DELETE(request: Request, { params }: Props) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;
    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const res = await api.delete(`/notes/${id}`, {
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

export async function PATCH(request: Request, { params }: Props) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;
    const body = await request.json();
    const cookieHeader = toUpstreamCookieHeader(cookieStore);

    const res = await api.patch(`/notes/${id}`, body, {
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
