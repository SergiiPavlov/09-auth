'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkSession, getUser, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

const PRIVATE_PREFIXES = ['/profile', '/notes'];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function handleUnauthorized() {
      clearIsAuthenticated();
      if (!isPrivateRoute(pathname)) {
        return;
      }

      try {
        await logout();
      } catch {
        // ignore network errors during best-effort logout
      }

      if (!cancelled) {
        router.replace('/sign-in');
      }
    }

    async function verifySession() {
      setIsChecking(true);

      try {
        const hasSession = await checkSession();
        if (cancelled) {
          return;
        }

        if (!hasSession) {
          await handleUnauthorized();
          return;
        }

        const user = await getUser();
        if (cancelled) {
          return;
        }

        setAuthenticated(user);
      } catch {
        if (!cancelled) {
          await handleUnauthorized();
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, setAuthenticated, clearIsAuthenticated]);

  if (isChecking) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Checking session…</div>;
  }

  if (!isAuthenticated && isPrivateRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}
