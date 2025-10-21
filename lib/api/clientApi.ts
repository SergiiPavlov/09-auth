'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';
import { isAxiosError } from 'axios';

type UnknownRecord = Record<string, unknown>;

function pickUserFromPayload(payload: unknown): UnknownRecord | null {
  if (!payload || typeof payload !== 'object') return null;

  // Массив? Поищем в каждом элементе
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const candidate = pickUserFromPayload(item);
      if (candidate) return candidate;
    }
    return null;
  }

  const data = payload as UnknownRecord;

  // Наиболее частые варианты обёрток
  if (data.user && typeof data.user === 'object') {
    const nested = pickUserFromPayload(data.user);
    if (nested) return nested;
  }
  if (data.data && typeof data.data === 'object') {
    const nested = pickUserFromPayload(data.data);
    if (nested) return nested;
  }

  return data;
}

function extractUser(payload: unknown): User | null {
  const data = pickUserFromPayload(payload);
  if (!data) return null;

  const email = typeof (data as any).email === 'string' ? ((data as any).email as string) : null;

  // username: берём по приоритету username → name → часть email до @
  let username: string | null = null;
  if (typeof (data as any).username === 'string') username = (data as any).username;
  else if (typeof (data as any).name === 'string') username = (data as any).name;
  else if (email) username = email.split('@')[0];

  const avatarURL =
    typeof (data as any).avatarURL === 'string'
      ? ((data as any).avatarURL as string)
      : typeof (data as any).avatar === 'string'
      ? ((data as any).avatar as string)
      : null;

  if (!email || !username) return null;

  const user: User = {
    email,
    username,
    avatarURL,
    avatar: avatarURL ?? null,
  };
  return user;
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
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Гасим только ожидаемые 401/403 (уже разлогинен)
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      if (status === 401 || status === 403) {
        // noop
      } else {
        throw err; // непрогнозируемые ошибки не скрываем
      }
    } else {
      throw err;
    }
  } finally {
    useAuthStore.getState().clearIsAuthenticated();
  }
}

export async function getSession() {
  try {
    const res = await api.get('/auth/session');
    const user = extractUser(res.data);
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
