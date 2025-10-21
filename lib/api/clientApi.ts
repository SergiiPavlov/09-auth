'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';

type UnknownRecord = Record<string, unknown>;

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const r = value as UnknownRecord;
  return typeof r.email === 'string' && typeof r.username === 'string';
}

function extractUser(payload: unknown): User | null {
  if (isUser(payload)) return payload;

  if (!payload || typeof payload !== 'object') return null;
  const data = payload as UnknownRecord;

  // common wrappers
  if (isUser(data.user)) return data.user as User;
  if (isUser(data.data)) return data.data as User;

  // nested objects
  if (data.user && typeof data.user === 'object') {
    const u = extractUser(data.user);
    if (u) return u;
  }
  if (data.data && typeof data.data === 'object') {
    const u = extractUser(data.data);
    if (u) return u;
  }

  // arrays
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const u = extractUser(item);
      if (u) return u;
    }
  }

  return null;
}

type RegisterDto = { email: string; password: string };
type LoginDto = { email: string; password: string };

export async function register(dto: RegisterDto) {
  const res = await api.post('/auth/register', dto);
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

export async function login(dto: LoginDto) {
  const res = await api.post('/auth/login', dto);
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

export async function logout() {
  await api.post('/auth/logout');
  useAuthStore.getState().clearIsAuthenticated();
}

export async function getSession() {
  try {
    const s = await api.get('/auth/session');
    const userFromSession = extractUser(s.data);
    if (userFromSession) {
      useAuthStore.getState().setUser(userFromSession);
      return userFromSession;
    }
    // Fallback to explicit /users/me if session endpoint didn't include user
    const me = await api.get('/users/me');
    const user = extractUser(me.data);
    if (user) {
      useAuthStore.getState().setUser(user);
      return user;
    }
    useAuthStore.getState().clearIsAuthenticated();
    return null;
  } catch {
    useAuthStore.getState().clearIsAuthenticated();
    return null;
  }
}

// Экспорт базового клиентского инстанса (как было)
export const clientApi = api;

export async function updateMe(username: string) {
  const res = await api.patch('/users/me', { username });
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}
