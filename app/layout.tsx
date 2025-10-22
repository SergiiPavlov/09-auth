import AuthProvider from '@/components/AuthProvider/AuthProvider';
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Roboto } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell/AppShell';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

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

export default function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.variable}>
        <AppShell>
          <TanStackProvider><AuthProvider>
{children}
</AuthProvider></TanStackProvider>
          {modal}
        </AppShell>
      </body>
    </html>
  );
}
