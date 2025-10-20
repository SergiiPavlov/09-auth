'use client';

import type { ReactNode } from 'react';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Toaster } from 'react-hot-toast';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <TanStackProvider>
      <Header />
      <Toaster />
      {children}
      <Footer />
    </TanStackProvider>
  );
}
