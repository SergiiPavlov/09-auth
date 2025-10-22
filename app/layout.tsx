import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import AppShell from '@/components/AppShell/AppShell';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'NoteHub', template: '%s · NoteHub' },
  description: 'NoteHub demo: search, filter, paginate notes.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'NoteHub',
    description: 'NoteHub demo: search, filter, paginate notes.',
    images: [OG_IMAGE],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
    apple: ['/icon.svg'],
  },
};

interface RootLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <TanStackProvider>
          <AuthProvider>
            <AppShell>
              <>{children}</>
              {modal}
            </AppShell>
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
