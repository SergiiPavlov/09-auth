'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/SignInPage.module.css';
import { login } from '@/lib/api/clientApi';
import { getErrorMessage } from '@/lib/errors';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      await login({ email, password });
      router.push('/profile');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.mainContent}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Sign in</h1>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" className={styles.input} required />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </main>
  );
}
