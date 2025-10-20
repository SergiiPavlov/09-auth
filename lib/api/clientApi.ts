'use client';

import { api } from './api';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';

type RegisterDto = { email: string; password: string };
type LoginDto = { email: string; password: string };

export async function register(dto: RegisterDto) {
  const res = await api.post('/auth/register', dto);
  const user: User = res.data?.user ?? res.data;
  useAuthStore.getState().setUser(user);
  return user;
}

export async function login(dto: LoginDto) {
  const res = await api.post('/auth/login', dto);
  const user: User = res.data?.user ?? res.data;
  useAuthStore.getState().setUser(user);
  return user;
}

export async function logout() {
  await api.post('/auth/logout');
  useAuthStore.getState().clearIsAuthenticated();
}

export async function getSession() {
  try {
    const res = await api.get('/auth/session');
    const user: User | null = res.data?.user ?? res.data ?? null;
    if (user && user.email) {
      useAuthStore.getState().setUser(user);
    } else {
      useAuthStore.getState().clearIsAuthenticated();
    }
    return user;
  } catch {
    useAuthStore.getState().clearIsAuthenticated();
    return null;
  }
}

// Экспорт базового клиентского инстанса (как было)
export const clientApi = api;

export async function updateMe(username: string) {
  const res = await api.patch('/users/me', { username });
  const user: User = res.data?.user ?? res.data;
  useAuthStore.getState().setUser(user);
  return user;
}
