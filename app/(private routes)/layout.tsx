import type { ReactNode } from 'react';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

export default function PrivateRoutesLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode; // ОБЯЗАТЕЛЬНО
}) {
  return (
    <AuthProvider enforceAuth>
      {children}
      {modal}
    </AuthProvider>
  );
}
