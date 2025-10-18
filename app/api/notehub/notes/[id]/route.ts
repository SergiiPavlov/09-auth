import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  buildNotehubUrl,
  createNotehubHeaders,
  handleNotehubProxyError,
  relayNotehubResponse,
} from '../../utils';
import { getMockNoteById } from '../../mock-data';

// Next.js 15: второй аргумент должен иметь params: Promise<...>
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(String(id))}`);

  try {
    const response = await fetch(url, {
      headers: createNotehubHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    return await relayNotehubResponse(response);
  } catch (error) {
    console.warn(`[notehub] Falling back to mock note ${id}.`, error);
    const mockNote = getMockNoteById(id);
    if (mockNote) {
      return NextResponse.json(mockNote, {
        status: 200,
        headers: { 'x-notehub-mock': '1' },
      });
    }

    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(String(id))}`);
  const body = await req.text();

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: createNotehubHeaders({ 'content-type': 'application/json' }),
      body,
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = buildNotehubUrl(`/notes/${encodeURIComponent(String(id))}`);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createNotehubHeaders(),
      cache: 'no-store',
    });
    return await relayNotehubResponse(response);
  } catch (error) {
    return handleNotehubProxyError(error);
  }
}
