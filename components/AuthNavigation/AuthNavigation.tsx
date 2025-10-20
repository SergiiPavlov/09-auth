'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styles from '@/app/styles/AuthNavigation.module.css';
import { getSession, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthNavigation() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useQuery({ queryKey: ['auth', 'session'], queryFn: getSession, staleTime: 60_000 });

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/sign-in');
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <li className={styles.navigationItem}>
          <Link prefetch={false} href="/sign-in" className={styles.navigationLink}>
            Login
          </Link>
        </li>
        <li className={styles.navigationItem}>
          <Link prefetch={false} href="/sign-up" className={styles.navigationLink}>
            Sign up
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={styles.navigationItem}>
        <Link prefetch={false} href="/profile" className={styles.navigationLink}>
          Profile
        </Link>
      </li>
      <li className={styles.navigationItem}>
        <p className={styles.userEmail}>{user?.email ?? 'User email'}</p>
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </li>
    </>
  );
}
