'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * AuthProvider: подтягивает сессию на клиенте и контролирует доступ к приватному контенту.
 * - Если enforceAuth=true, при отсутствии сессии скрывает children (а middleware сделает редирект).
 * - Показывает простой лоадер, пока идёт первичная проверка.
 */
export default function AuthProvider({
  children,
  enforceAuth = false,
}: {
  children: React.ReactNode;
  enforceAuth?: boolean;
}) {
  const { isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(true);

  const { isLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: getSession,
    staleTime: 60_000,
  });

  useEffect(() => {
    // Когда кверя впервые отработала, перестаём показывать лоадер
    if (!isLoading) setChecking(false);
  }, [isLoading]);

  if (checking) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Checking session…</div>;
  }

  if (enforceAuth && !isAuthenticated) {
    // Ничего не рендерим — middleware уже перенаправит пользователя на /sign-in
    return null;
  }

  return <>{children}</>;
}
