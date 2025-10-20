import type { ReactNode } from 'react';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PrivateRoutesLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <AuthProvider enforceAuth>
      {children}
      {modal}
    </AuthProvider>
  );
}
