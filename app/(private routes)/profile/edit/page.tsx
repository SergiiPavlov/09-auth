'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/EditProfilePage.module.css';
import { getUser, updateUser } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { getErrorMessage } from '@/lib/errors';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? 'user_email@example.com');
  const [avatar, setAvatar] = useState(user?.avatar ?? '/icon.svg');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureProfile() {
      if (user) {
        setUsername(user.username);
        setEmail(user.email);
        setAvatar(user.avatar ?? '/icon.svg');
        return;
      }

      try {
        const freshUser = await getUser();
        if (cancelled) {
          return;
        }
        setUser(freshUser);
        setUsername(freshUser.username);
        setEmail(freshUser.email);
        setAvatar(freshUser.avatar ?? '/icon.svg');
      } catch {
        // ignore fetch error; AuthProvider/middleware will handle auth state
      }
    }

    ensureProfile();

    return () => {
      cancelled = true;
    };
  }, [setUser, user]);

  const updateProfileMutation = useMutation({
    mutationFn: () => updateUser({ username: username.trim() }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      router.push('/profile');
      router.refresh();
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, 'Update failed'));
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    updateProfileMutation.mutate();
  }

  function handleCancel() {
    router.push('/profile');
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.profileCard}>
        <h1 className={styles.formTitle}>Edit Profile</h1>

        <Image src={avatar} alt="User Avatar" width={120} height={120} className={styles.avatar} />

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
            <button
              type="submit"
              className={styles.saveButton}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
            >
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
