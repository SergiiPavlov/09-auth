import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auth | NoteHub',
  description: 'Sign in or create an account to access private features.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
