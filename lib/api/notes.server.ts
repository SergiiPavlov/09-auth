import type { Note } from '@/types/note';
import { serverApi } from './serverApi';

/**
 * Server-only fetch for a single note by id.
 * Uses serverApi() to include request cookies via next/headers.
 */
export async function fetchNoteByIdServer(id: string): Promise<Note> {
  const api = serverApi();
  const res = await api.get(`/notes/${id}`);
  return res.data as Note;
}


export type FetchNotesParams = {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
};

export async function fetchNotesServer(params: FetchNotesParams = {}) {
  const api = serverApi();
  const res = await api.get('/notes', { params });
  const raw = res.data as any;

  // Normalize the response shape similarly to client-side fetchNotes
  let notes = Array.isArray(raw?.items) ? raw.items : raw?.notes ?? raw?.data ?? [];
  if (!Array.isArray(notes) && raw?.data && Array.isArray(raw.data)) {
    notes = raw.data;
  }
  const total =
    raw?.totalItems ?? raw?.total ?? raw?.totalCount ?? (Array.isArray(notes) ? notes.length : 0);
  const perPage = typeof raw?.perPage === 'number' ? raw.perPage : (params.perPage ?? 12);
  const page = typeof raw?.page === 'number' ? raw.page : (params.page ?? 1);
  const totalPages = typeof raw?.totalPages === 'number'
    ? raw.totalPages
    : Math.max(1, Math.ceil((total || 0) / (perPage || 1)));

  return { notes, total, page, perPage, totalPages };
}

export async function getCategoriesServer(): Promise<{ id: string; name: string }[]> {
  const api = serverApi();
  const FALLBACK = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];
  try {
    const res = await api.get('/notes/categories');
    const raw = res.data as any;
    const items = (raw?.items ?? raw?.categories ?? raw) as any;
    if (Array.isArray(items) && items.length && items[0]?.id && items[0]?.name) {
      return items as { id: string; name: string }[];
    }
    if (Array.isArray(items) && items.length && typeof items[0] === 'string') {
      return (items as string[]).map((name, idx) => ({ id: String(idx+1), name }));
    }
    return FALLBACK.map((name, idx) => ({ id: String(idx+1), name }));
  } catch {
    return FALLBACK.map((name, idx) => ({ id: String(idx+1), name }));
  }
}
