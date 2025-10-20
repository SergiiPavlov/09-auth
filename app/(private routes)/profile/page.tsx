import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/styles/ProfilePage.module.css';
import { getMe } from '@/lib/api/serverApi';

export const metadata: Metadata = {
  title: 'Profile | NoteHub',
  description: 'Your profile information.',
};

export default async function ProfilePage() {
  const user = await getMe();

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Profile</h1>
      <div className={styles.card}>
        <div className={styles.avatar}>
          <Image src="/icon.svg" alt="Avatar" width={64} height={64} />
        </div>
        <div className={styles.info}>
          <p>
            <strong>Username:</strong> {user?.username ?? '—'}
          </p>
          <p>
            <strong>Email:</strong> {user?.email ?? '—'}
          </p>
        </div>
        <div className={styles.actions}>
          <Link prefetch={false} href="/profile/edit" className={styles.button}>
            Edit profile
          </Link>
        </div>
      </div>
    </section>
  );
}
