'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';
import { isAxiosError } from 'axios';

type AnyRecord = Record<string, unknown>;

/** Type guard: checks that value looks like our User */
function isUser(v: unknown): v is User {
  if (!v || typeof v !== 'object') return false;
  const obj = v as AnyRecord;
  return typeof obj.email === 'string' && typeof obj.username === 'string';
}

/** Some endpoints may wrap/shape user differently – unwrap safely */
function extractUser(payload: unknown): User | null {
  if (!payload) return null;

  // direct user
  if (isUser(payload)) return payload;

  // wrapped { user: {...} }
  if (typeof payload === 'object' && payload !== null) {
    const rec = payload as AnyRecord;
    if (isUser(rec.user)) return rec.user;

    // arrays (defensive)
    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (isUser(item)) return item;
      }
    }
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
    const user = extractUser(res.data);
    if (user) {
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