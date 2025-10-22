import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from '@/app/styles/ProfilePage.module.css';
import { getMe } from '@/lib/api/serverApi';

export const metadata: Metadata = {
  title: 'Profile Page · NoteHub',
  description: 'Profile details for the authenticated NoteHub user.',
  openGraph: {
    title: 'Profile Page · NoteHub',
    description: 'Profile details for the authenticated NoteHub user.',
    url: '/profile',
  },
};

export default async function ProfilePage() {
  const user = await getMe();
  if (!user) {
    redirect('/sign-in');
  }

  const username = user.username ?? 'your_username';
  const email = user.email ?? 'your_email@example.com';
  const avatar = user.avatar ?? '/icon.svg';

  return (
    <main className={styles.mainContent}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <h1 className={styles.formTitle}>Profile Page</h1>
          <Link prefetch={false} href="/profile/edit" className={styles.editProfileButton}>
            Edit Profile
          </Link>
        </div>
        <div className={styles.avatarWrapper}>
          <Image src={avatar} alt="User Avatar" width={120} height={120} className={styles.avatar} />
        </div>
        <div className={styles.profileInfo}>
          <p>Username: {username}</p>
          <p>Email: {email}</p>
        </div>
      </div>
    </main>
  );
}
