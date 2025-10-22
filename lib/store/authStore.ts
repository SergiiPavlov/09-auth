'use client';
import { create } from 'zustand';
import type { User } from '@/types/user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuthenticated: (user: User) => void;
  clearIsAuthenticated: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setAuthenticated: (user: User) => set({ user, isAuthenticated: true }),
  clearIsAuthenticated: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set((state) => ({ ...state, user, isAuthenticated: !!user })),
}));
