'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/styles/EditProfilePage.module.css';
import { getSession, updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если стора нет — подтянем сессию для первичного значения
    if (!user?.username) {
      getSession().then((u) => {
        if (u?.username) setUsername(u.username);
      });
    }
  }, [user?.username]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateMe(username.trim());
      // updateMe сам редиректит на /profile
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Update failed');
      setSaving(false);
    }
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Edit profile</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Username
          <input
            className={styles.input}
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className={styles.link} onClick={() => router.back()}>
            Cancel
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </section>
  );
}
