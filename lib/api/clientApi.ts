'use client';
import api from './api';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

type LoginBody = { email: string; password: string };
type RegisterBody = { email: string; password: string };
type UpdateUserBody = { username: string };

export async function login(body: LoginBody): Promise<User> {
  const { data } = await api.post<User>('/auth/login', body);
  return data;
}
export async function register(body: RegisterBody): Promise<User> {
  const { data } = await api.post<User>('/auth/register', body);
  return data;
}
export async function logout(): Promise<void> { await api.post('/auth/logout'); }
export async function checkSession(): Promise<boolean> { try { await api.get('/auth/session'); return true; } catch { return false; } }
export async function getUser(): Promise<User> { const { data } = await api.get<User>('/users/me'); return data; }
export async function updateUser(payload: UpdateUserBody): Promise<User> { const { data } = await api.patch<User>('/users/me', payload); return data; }

export async function fetchNotes(params: { search?: string; page?: number; perPage?: number; tag?: string }): Promise<{ notes: Note[]; totalPages: number }> {
  const { data } = await api.get<{ notes: Note[]; totalPages: number }>('/notes', { params });
  return data;
}
export async function fetchNoteById(id: string): Promise<Note> { const { data } = await api.get<Note>(`/notes/${id}`); return data; }
export async function createNote(body: Pick<Note, 'title' | 'content' | 'tag'>): Promise<Note> { const { data } = await api.post<Note>('/notes', body); return data; }
export async function deleteNote(id: string): Promise<Note> { const { data } = await api.delete<Note>(`/notes/${id}`); return data; }


// Backward-compatible alias expected by legacy imports
export async function getSession(): Promise<boolean> {
  try { await api.get('/auth/session'); return true; } catch { return false; }
}


// Backward-compatible alias for updateUser
export async function updateMe(payload: { username: string }) {
  return updateUser(payload);
}
