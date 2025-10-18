import type { AxiosResponse } from 'axios';
import { notehubClient } from './client';
import type { Note, NoteTag } from '@/types/note';

export type NoteListResponse = {
  notes: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

type NoteListResponseServer = {
  items?: Note[];
  notes?: Note[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

export function normalizeNote(data: unknown): Note {
  const d = (data ?? {}) as Partial<Record<string, any>>;
  const safeTag: NoteTag =
    d.tag && ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'].includes(String(d.tag))
      ? (String(d.tag) as NoteTag)
      : 'Todo';

  return {
    id: String(d.id ?? ''),
    title: String(d.title ?? ''),
    content: String(d.content ?? ''),
    tag: safeTag,
    createdAt: String(d.createdAt ?? d.created_at ?? ''),
    updatedAt: String(d.updatedAt ?? d.updated_at ?? ''),
  };
}

export function normalizeFetchResponse(data: NoteListResponseServer): NoteListResponse {
  const raw = data?.items ?? data?.notes ?? [];
  const notes = raw.map(normalizeNote);
  const page = Number(data?.page ?? 1);
  const perPage = Number(data?.perPage ?? 12);
  const totalItems = Number(data?.totalItems ?? notes.length);
  const totalPages = Number(data?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(perPage, 1))));
  return { notes, page, perPage, totalItems, totalPages };
}

export async function fetchNotes(params: {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string | NoteTag;
} = {}): Promise<NoteListResponse> {
  const { page = 1, perPage = 12, search = '', tag } = params;
  const sendTag = tag && tag !== 'All' ? String(tag) : undefined;

  const res: AxiosResponse<NoteListResponseServer> = await notehubClient.get<NoteListResponseServer>('/notes', {
    params: {
      page,
      perPage,
      search: search || undefined,
      tag: sendTag,
    },
  });

  return normalizeFetchResponse(res.data);
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res: AxiosResponse<Note> = await notehubClient.get<Note>(`/notes/${id}`);
  return normalizeNote(res.data);
}

export async function createNote(payload: { title: string; content: string; tag: NoteTag }): Promise<Note> {
  const res: AxiosResponse<Note> = await notehubClient.post<Note>('/notes', payload);
  return normalizeNote(res.data);
}

export async function updateNote(
  id: string,
  payload: Partial<{ title: string; content: string; tag: NoteTag }>
): Promise<Note> {
  const res: AxiosResponse<Note> = await notehubClient.patch<Note>(`/notes/${id}`, payload);
  return normalizeNote(res.data);
}

export async function deleteNote(id: string): Promise<Note> {
  const res: AxiosResponse<Note> = await notehubClient.delete<Note>(`/notes/${id}`);
  return normalizeNote(res.data);
}

export type FetchNotesResponse = NoteListResponse;
