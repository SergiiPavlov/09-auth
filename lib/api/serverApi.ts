import { cookies } from 'next/headers';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';
import type { NoteCategory } from './clientApi';

function withCookiesConfig(): AxiosRequestConfig {
  const cookieHeader = cookies().toString();
  return cookieHeader
    ? {
        headers: {
          Cookie: cookieHeader,
        },
      }
    : {};
}

export async function getServerMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me', withCookiesConfig());
  return data;
}

export { getServerMe as getMe };

export async function fetchNotesServer(
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>('/notes', {
    ...withCookiesConfig(),
    params,
  });
  return data;
}

export async function fetchNoteByIdServer(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`, withCookiesConfig());
  return data;
}

export async function checkSessionServer(): Promise<AxiosResponse<User | null>> {
  return api.get<User | null>('/auth/session', withCookiesConfig());
}

export async function getCategoriesServer(): Promise<NoteCategory[]> {
  const { data } = await api.get<NoteCategory[] | string[]>('/notes/categories', withCookiesConfig());

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    return (data as string[]).map((name, index) => ({ id: `${index}`, name }));
  }

  if (Array.isArray(data)) {
    return data as NoteCategory[];
  }

  return [];
}
