'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';
import { isAxiosError } from 'axios';

// Базовые типы полезной нагрузки
type UnknownRecord = Record<PropertyKey, unknown>;
type UserPayload = unknown;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isUserRecord(value: unknown): value is User {
  if (!isRecord(value)) {
    return false;
  }

  const record = value as UnknownRecord;
  const { username, email, avatar, avatarURL, id } = record;

  const hasValidUsername = typeof username === 'string';
  const hasValidEmail = typeof email === 'string';
  const hasValidAvatar =
    avatar === undefined || avatar === null || typeof avatar === 'string';
  const hasValidAvatarURL =
    avatarURL === undefined ||
    avatarURL === null ||
    typeof avatarURL === 'string';
  const hasValidId =
    id === undefined || id === null || typeof id === 'string';

  return (
    hasValidUsername &&
    hasValidEmail &&
    hasValidAvatar &&
    hasValidAvatarURL &&
    hasValidId
  );
}

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

  if (isUserRecord(data)) {
    return data;
  }

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
    const res = await api.get('/auth/session');
    const user = pickUserFromPayload(res.data);
    if (user && user.email) {
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
