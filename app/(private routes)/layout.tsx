import type { ReactNode } from 'react';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PrivateRoutesLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode; // ОБЯЗАТЕЛЬНО
}) {
  return (
    <TanStackProvider>
      <AuthProvider enforceAuth>
        {children}
        {modal}
      </AuthProvider>
    </TanStackProvider>
  );
}
