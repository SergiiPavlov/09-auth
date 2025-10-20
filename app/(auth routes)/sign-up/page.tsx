'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/styles/SignUpPage.module.css';
import { register } from '@/lib/api/clientApi';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get('username') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    try {
      await register({ username, email, password });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Create account</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Username
          <input className={styles.input} type="text" name="username" placeholder="John" required />
        </label>
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
          {loading ? 'Creating…' : 'Sign up'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p className={styles.hint}>
        Already have an account?{' '}
        <Link prefetch={false} href="/sign-in" className={styles.link}>
          Sign in
        </Link>
      </p>
    </section>
  );
}
