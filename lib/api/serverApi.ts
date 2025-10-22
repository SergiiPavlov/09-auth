import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';
import type { NoteCategory } from './clientApi';

const UNAUTHORIZED_STATUSES = new Set([401, 403]);

function withCookiesConfig(): AxiosRequestConfig {
  try {
    const cookieHeader = cookies().toString();

    if (!cookieHeader) {
      return {};
    }

    return {
      headers: {
        Cookie: cookieHeader,
      },
    };
  } catch {
    return {};
  }
}

export async function getServerMe(): Promise<User | null> {
  try {
    const { data } = await api.get<User>('/users/me', withCookiesConfig());
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status && UNAUTHORIZED_STATUSES.has(error.response.status)) {
      return null;
    }
    throw error;
  }
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
