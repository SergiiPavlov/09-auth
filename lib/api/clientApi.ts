'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';

type UnknownRecord = Record<string, unknown>;

function pickUserFromPayload(payload: unknown): User | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const candidate = pickUserFromPayload(item);
      if (candidate) {
        return candidate;
      }
    }
    return null;
  }

  const data = payload as UnknownRecord;

  if (data.user) {
    const nested = pickUserFromPayload(data.user);
    if (nested) {
      return nested;
    }
  }

  if (data.data) {
    const nested = pickUserFromPayload(data.data);
    if (nested) {
      return nested;
    }
  }

  if (typeof data.email === 'string') {
    return data as User;
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
  try {
    await api.post('/auth/logout');
  } catch {
    // Если уже разлогинены или сеть упала — считаем это успешным выходом
  } finally {
    useAuthStore.getState().clearIsAuthenticated();
  }
}

export async function getSession() {
  try {
    const res = await api.get('/auth/session');
    const user = pickUserFromPayload(res.data);
    if (user && user.email) {
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
