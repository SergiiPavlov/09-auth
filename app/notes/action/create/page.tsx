import type { Metadata } from 'next';
import css from './CreateNote.module.css';
import NoteForm from '@/components/NoteForm/NoteForm';
import { getCategories } from '@/lib/api';

const APP_URL = 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

const PAGE_PATH = '/notes/action/create';

export const metadata = {
  title: 'Create note',
  description: 'Create a new note in your NoteHub.',
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: 'Create note',
    description: 'Create a new note in your NoteHub.',
    url: `${APP_URL}${PAGE_PATH}`,
    siteName: 'NoteHub',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Create note' }],
    type: 'website',
  },
} satisfies Metadata;

export default async function CreateNote() {
  const categories = await getCategories();

  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm categories={categories} />
      </div>
    </main>
  );
}
