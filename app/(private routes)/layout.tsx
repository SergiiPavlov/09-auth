import type { ReactNode } from 'react';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

interface PrivateRoutesLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function PrivateRoutesLayout({ children, modal }: PrivateRoutesLayoutProps) {
  return <AuthProvider enforceAuth>{children}{modal}</AuthProvider>;
}
