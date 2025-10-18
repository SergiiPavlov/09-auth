import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const APP_URL = 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

const PAGE_PATH = '/notes';

export const metadata = {
  title: 'All notes',
  description: 'Browse all of your notes in one place.',
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: 'All notes',
    description: 'Browse all of your notes in one place.',
    url: `${APP_URL}${PAGE_PATH}`,
    siteName: 'NoteHub',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'All notes' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All notes',
    description: 'Browse all of your notes in one place.',
    images: [OG_IMAGE],
  },
  metadataBase: new URL(APP_URL),
} satisfies Metadata;

export default function NotesPage() {
  redirect('/notes/filter/All');
}
