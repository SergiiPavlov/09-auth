'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/styles/SignInPage.module.css';
import { login } from '@/lib/api/clientApi';

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Sign in</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="email@example.com"
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </label>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p className={styles.hint}>
        Don&apos;t have an account?{' '}
        <Link prefetch={false} href="/sign-up" className={styles.link}>
          Sign up
        </Link>
      </p>
    </section>
  );
}
