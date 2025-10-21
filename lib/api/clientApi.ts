'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';
import { isAxiosError } from 'axios';

type AnyRecord = Record<string, unknown>;

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

// Keep axios instance export (used elsewhere)
export const clientApi = api;

type AuthDto = { email: string; password: string };

export async function register(dto: AuthDto) {
  const res = await api.post('/auth/register', dto);
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

export async function login(dto: AuthDto) {
  const res = await api.post('/auth/login', dto);
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}

/** Logout: swallow 401/403 (already logged out), clear store anyway */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      if (status !== 401 && status !== 403) {
        // unexpected – rethrow to surface real errors
        throw err;
      }
    } else {
      throw err;
    }
  } finally {
    useAuthStore.getState().clearIsAuthenticated();
  }
}

/** Session check – returns user or null (when unauthenticated) */
export async function getSession() {
  try {
    const res = await api.get('/auth/session');
    const user = pickUserFromPayload(res.data);
    if (user && user.email) {
      useAuthStore.getState().setUser(user);
      return user;
    }
    // Some backends respond 200 with no body – treat as guest
    return null;
  } catch (err) {
    useAuthStore.getState().clearIsAuthenticated();
    return null;
  }
}

/** Fetch profile – clear auth on 401/403 */
export async function getMe() {
  try {
    const res = await api.get('/users/me');
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

/** Update username (profile) */
export async function updateMe(username: string) {
  const res = await api.patch('/users/me', { username });
  const user = extractUser(res.data);
  if (user) useAuthStore.getState().setUser(user);
  return user;
}