'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/EditProfilePage.module.css';
import { getSession, updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { getErrorMessage } from '@/lib/errors';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? 'user_email@example.com');
  const [avatar, setAvatar] = useState(user?.avatarURL ?? user?.avatar ?? '/icon.svg');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatar(user.avatarURL ?? user.avatar ?? '/icon.svg');
      return;
    }

    getSession().then((sessionUser) => {
      if (!sessionUser) {
        return;
      }
      setUsername(sessionUser.username);
      setEmail(sessionUser.email);
      setAvatar(sessionUser.avatarURL ?? sessionUser.avatar ?? '/icon.svg');
    });
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await updateMe(username.trim());
      router.push('/profile');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Update failed'));
      setIsSaving(false);
    }
  }

  function handleCancel() {
    router.push('/profile');
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.profileCard}>
        <h1 className={styles.formTitle}>Edit Profile</h1>

        <Image src={avatar} alt="User Avatar" width={120} height={120} className={styles.avatar} unoptimized />

        <form className={styles.profileInfo} onSubmit={handleSubmit}>
          <div className={styles.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <p>Email: {email}</p>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className={styles.cancelButton} onClick={handleCancel} disabled={isSaving}>
              Cancel
            </button>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
