import { api } from '@/lib/api/api';
import type { Note } from '@/types/note';

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
  const page = Number(params.page || 1);
  const perPage = Number(params.perPage || 12);

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

  const total = Number(raw?.total ?? raw?.totalItems ?? raw?.totalCount ?? notes.length);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return { notes, total, page, perPage, totalPages };
}

export async function fetchNotes(params: FetchNotesParams = {}): Promise<FetchNotesResponse> {
  const res = await api.get('/notes', {
    params: {
      page: params.page,
      limit: params.perPage, // popular param name
      perPage: params.perPage,
      search: params.search,
      tag: params.tag,
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
