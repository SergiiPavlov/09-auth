import { cookies } from 'next/headers';
import type { AxiosResponse } from 'axios';
import api from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

function withCookie() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  return { headers: { Cookie: cookieHeader } } as const;
}

export async function getServerMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me', withCookie());
  return data;
}
export { getServerMe as getMe };

export async function fetchNotesServer(params: { search?: string; page?: number; perPage?: number; tag?: string }): Promise<{ notes: Note[]; totalPages: number }> {
  const { data } = await api.get<{ notes: Note[]; totalPages: number }>('/notes', { ...withCookie(), params });
  return data;
}
export async function fetchNoteByIdServer(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`, withCookie());
  return data;
}
export async function checkSessionServer(): Promise<AxiosResponse<any>> {
  return api.get('/auth/session', withCookie());
}


// Optional categories endpoint (used by sidebar); proxied via app/api/notes/categories
export async function getCategoriesServer(): Promise<string[]> {
  const { data } = await api.get<string[]>('/notes/categories', withCookie());
  return data;
}
