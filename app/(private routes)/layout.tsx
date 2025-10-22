import type { ReactNode } from 'react';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PrivateRoutesLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
