import { api } from '@/lib/api/api';
import type { Note, NoteTag } from '@/types/note';

export type FetchNotesParams = {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
};

export type FetchNotesResponse = {
  notes: Note[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

function normalizeNotesResponse(raw: any, params: FetchNotesParams): FetchNotesResponse {
  const page = Number(params.page || raw?.page || 1);
  const perPage = Number(params.perPage || raw?.perPage || 12);

  let notes: Note[] = [];
  if (Array.isArray(raw)) {
    notes = raw as Note[];
  } else if (raw?.notes && Array.isArray(raw.notes)) {
    notes = raw.notes;
  } else if (raw?.items && Array.isArray(raw.items)) {
    notes = raw.items;
  } else if (raw?.data && Array.isArray(raw.data)) {
    notes = raw.data;
  }

  const totalFromCounts =
    raw?.totalItems ?? raw?.total ?? raw?.totalCount ?? undefined;
  const totalPagesFromRaw =
    raw?.totalPages ?? raw?.pageCount ?? raw?.pages ?? undefined;

  let totalPages = Number(totalPagesFromRaw);
  if (!Number.isFinite(totalPages) || totalPages <= 0) {
    const totalCount = Number(totalFromCounts ?? notes.length);
    totalPages = Math.max(1, Math.ceil(totalCount / Math.max(perPage, 1)));
  }

  const total =
    Number(totalFromCounts) && Number(totalFromCounts) > 0
      ? Number(totalFromCounts)
      : Number.isFinite(totalPages) && totalPages > 0
      ? totalPages * perPage
      : notes.length;

  return { notes, total, page, perPage, totalPages };
}

export async function fetchNotes(params: FetchNotesParams = {}): Promise<FetchNotesResponse> {
  const res = await api.get('/notes', {
      params: {
        page: params.page,
        perPage: params.perPage,
        limit: params.perPage, // some backends accept `limit`
        search: params.search || undefined,
        tag: params.tag && params.tag !== 'All' ? params.tag : undefined,
      },
  });
  return normalizeNotesResponse(res.data, params);
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await api.get(`/notes/${id}`);
  const raw = res.data;
  const note: Note = raw?.note ?? raw;
  return note as Note;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}


// ---- moved from legacy lib/api.ts ----
export type NewNoteData = {
  title: string;
  content: string;
  tag: NoteTag;
};

export async function createNote(data: NewNoteData) {
  const res = await api.post('/notes', {
    title: data.title,
    content: data.content,
    tag: data.tag, // must be one of: 'Todo' | 'Work' | 'Personal' | 'Meeting' | 'Shopping'
  });
  return res.data;
}


export async function getCategories(): Promise<{ id: string; name: string }[]> {
  const res = await api.get('/notes/categories');
  const items = (res.data?.items ?? res.data?.categories ?? res.data) as any;
  if (
    Array.isArray(items) &&
    items.length &&
    items[0] &&
    items[0].id &&
    items[0].name
  ) {
    return items as { id: string; name: string }[];
  }
  return [];
}
