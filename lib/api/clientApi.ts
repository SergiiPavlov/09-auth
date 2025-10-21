'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';
import { isAxiosError } from 'axios';

// Базовые типы полезной нагрузки
type UnknownRecord = Record<string, unknown>;
type UserPayload = unknown;

/** Узкое, явное сужение к типу User */
function isUser(x: unknown): x is User {
  if (!x || typeof x !== 'object') return false;
  const o = x as UnknownRecord;
  return typeof o['email'] === 'string' && typeof o['username'] === 'string';
}

/** Нормализация объекта пользователя (учитывает avatar/avatarURL) */
function normalizeUser(x: unknown): User | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as UnknownRecord;

  const email = typeof o['email'] === 'string' ? (o['email'] as string) : null;
  const username = typeof o['username'] === 'string' ? (o['username'] as string) : null;

  if (!email || !username) return null;

  const avatar =
    typeof o['avatar'] === 'string'
      ? (o['avatar'] as string)
      : typeof o['avatarURL'] === 'string'
      ? (o['avatarURL'] as string)
      : null;

  return { email, username, avatar };
}

/** Рекурсивно вытаскиваем User из произвольной формы ответа */
function pickUserFromPayload(payload: unknown): User | null {
  if (!payload || typeof payload !== 'object') return null;

  // Если пришёл массив — ищем первого валидного User
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const candidate = pickUserFromPayload(item);
      if (candidate) return candidate;
    }
    return null;
  }

  // Пробуем нормализовать «как есть»
  const normalized = normalizeUser(payload);
  if (normalized) return normalized;

  // Частые обёртки бэкендов: { user }, { data }, { result }, { payload }
  const container = payload as UnknownRecord;
  const possibleKeys = ['user', 'data', 'result', 'payload'];
  for (const key of possibleKeys) {
    if (key in container) {
      const nested = pickUserFromPayload((container as UnknownRecord)[key]);
      if (nested) return nested;
    }
  }

  return null;
}

/** Для совместимости с остальным кодом */
function extractUser(payload: unknown): User | null {
  return pickUserFromPayload(payload);
}

// Экспорт axios-инстанса как раньше
export const clientApi = api;

type AuthDto = { email: string; password: string };

/** Register */
export async function register(dto: AuthDto): Promise<User | null> {
  const res = await api.post<UserPayload>('/auth/register', dto);
  const user = extractUser((res as any).data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

/** Login */
export async function login(dto: AuthDto): Promise<User | null> {
  const res = await api.post<UserPayload>('/auth/login', dto);
  const user = extractUser((res as any).data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

/** Logout: проглатываем 401/403, стор всё равно чистим */
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
    const res = await api.get<UserPayload>('/auth/session');
    const user = pickUserFromPayload(res.data);
    if (user) {
      useAuthStore.getState().setUser(user);
      return user;
    }
    return null;
  } catch (_err) {
    useAuthStore.getState().clearIsAuthenticated();
    return null;
  }
}

/** /users/me (SSR-несовместимых зависимостей тут нет) */
export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get<UserPayload>('/users/me');
    const user = extractUser((res as any).data);
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
  const res = await api.patch<UserPayload>('/users/me', { username });
  const user = extractUser((res as any).data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}
