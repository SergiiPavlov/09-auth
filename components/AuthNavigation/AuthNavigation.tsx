'use client';

import Link from 'next/link';
import styles from '@/app/styles/AuthNavigation.module.css';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getSession, logout } from '@/lib/api/clientApi';

export default function AuthNavigation() {
  const { isAuthenticated } = useAuthStore();

  // Подтягиваем сессию на клиенте и синхронизируем стор
  useQuery({ queryKey: ['auth', 'session'], queryFn: getSession, staleTime: 60_000 });

  if (!isAuthenticated) {
    return (
      <nav aria-label="Auth Navigation">
        <ul className={styles.nav}>
          <li>
            <Link prefetch={false} href="/sign-in" className={styles.link}>
              Login
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/sign-up" className={styles.primary}>
              Sign up
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="User Navigation">
      <ul className={styles.nav}>
        <li>
          <Link prefetch={false} href="/profile" className={styles.link}>
            Profile
          </Link>
        </li>
        <li>
          <button className={styles.link} type="button" onClick={() => logout()}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
