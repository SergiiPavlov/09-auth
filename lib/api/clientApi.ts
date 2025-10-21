'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';
import { isAxiosError } from 'axios';

// Guard: простой объект (не null, не массив)
function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

/** Нормализация объекта пользователя (учитывает avatar/avatarURL) */
function normalizeUser(x: unknown): User | null {
  if (!isPlainObject(x)) return null;

  const email = typeof x['email'] === 'string' ? (x['email'] as string) : null;
  const username =
    typeof x['username'] === 'string' ? (x['username'] as string) : null;

  if (!email || !username) return null;

  const avatar =
    typeof x['avatar'] === 'string'
      ? (x['avatar'] as string)
      : typeof x['avatarURL'] === 'string'
      ? (x['avatarURL'] as string)
      : null;

  return { email, username, avatar };
}

/** Рекурсивно вытаскиваем User из произвольной формы ответа */
function pickUserFromPayload(payload: unknown): User | null {
  if (payload == null) return null;

  // Если пришёл массив — найдём первого валидного пользователя
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const candidate = pickUserFromPayload(item);
      if (candidate) {
        return candidate;
      }
    }
    return null;
  }

  // Попытка нормализовать «как есть»
  const normalized = normalizeUser(payload);
  if (normalized) return normalized;

  // Частые обёртки: { user }, { data }, { result }, { payload }
  if (isPlainObject(payload)) {
    const container = payload as Record<string, unknown>;
    const possibleKeys = ['user', 'data', 'result', 'payload'] as const;
    for (const key of possibleKeys) {
      if (key in container) {
        const nested = pickUserFromPayload(container[key]);
        if (nested) return nested;
      }
    }
  }

  return null;
}

/** Совместимый слой-обёртка */
function extractUser(payload: unknown): User | null {
  return pickUserFromPayload(payload);
}

// Экспорт axios-инстанса как раньше
export const clientApi = api;

type AuthDto = { email: string; password: string };

/** Register */
export async function register(dto: AuthDto): Promise<User | null> {
  const res = await api.post<unknown>('/auth/register', dto);
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

/** Login */
export async function login(dto: AuthDto): Promise<User | null> {
  const res = await api.post<unknown>('/auth/login', dto);
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

/** Logout: проглатываем 401/403, стор чистим всегда */
export async function logout(): Promise<void> {
  try {
    await api.post<void>('/auth/logout');
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      if (status !== 401 && status !== 403) throw err;
    } else {
      throw err;
    }
  } finally {
    useAuthStore.getState().clearIsAuthenticated();
  }
}

/** Session check — возвращает пользователя или null */
export async function getSession(): Promise<User | null> {
  try {
    const res = await api.get<unknown>('/auth/session');
    const user = extractUser(res.data);
    if (user) {
      useAuthStore.getState().setUser(user);
      return user;
    }
    return null;
  } catch {
    useAuthStore.getState().clearIsAuthenticated();
    return null;
  }
}

/** /users/me — получить профиль */
export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get<unknown>('/users/me');
    const user = extractUser(res.data);
    if (user) {
      useAuthStore.getState().setUser(user);
      return user;
    }
    return null;
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      if (status === 401 || status === 403) {
        useAuthStore.getState().clearIsAuthenticated();
        return null;
      }
    }
    throw err;
  }
}

/** PATCH /users/me — обновляем username */
export async function updateMe(username: string): Promise<User | null> {
  const res = await api.patch<unknown>('/users/me', { username });
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}
