'use client';

import { isAxiosError } from 'axios';
import api from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

export type LoginBody = { email: string; password: string };
export type RegisterBody = { email: string; password: string };
export type UpdateUserBody = { username: string };
export type FetchNotesParams = {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: string;
};

export type FetchNotesResponse = {
  notes: Note[];
  totalPages: number;
  page: number;
  perPage: number;
  total: number;
};

export type CreateNoteBody = Pick<Note, 'title' | 'content' | 'tag'>;

export type NoteCategory = { id: string; name: string };

export async function login(body: LoginBody): Promise<User> {
  const { data } = await api.post<User>('/auth/login', body);
  return data;
}

export async function register(body: RegisterBody): Promise<User> {
  const { data } = await api.post<User>('/auth/register', body);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function checkSession(): Promise<boolean> {
  try {
    const response = await api.get<User | null>('/auth/session');
    const payload = response.data;
    return Boolean(payload && Object.keys(payload).length > 0);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return false;
    }
    throw error;
  }
}

export async function getUser(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}

export async function updateUser(body: UpdateUserBody): Promise<User> {
  const { data } = await api.patch<User>('/users/me', body);
  return data;
}

export async function fetchNotes(params: FetchNotesParams = {}): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>('/notes', { params });
  return data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
}

export async function createNote(body: CreateNoteBody): Promise<Note> {
  const { data } = await api.post<Note>('/notes', body);
  return data;
}

export async function deleteNote(id: string): Promise<Note> {
  const { data } = await api.delete<Note>(`/notes/${id}`);
  return data;
}

export async function getCategories(): Promise<NoteCategory[]> {
  const { data } = await api.get<NoteCategory[] | string[]>('/notes/categories');

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    return (data as string[]).map((name, index) => ({ id: `${index}`, name }));
  }

  if (Array.isArray(data)) {
    return data as NoteCategory[];
  }

  return [];
}

export const getSession = checkSession;
export const updateMe = updateUser;
