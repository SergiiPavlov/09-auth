import type { Metadata } from 'next';
import { unstable_noStore } from 'next/cache';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api/notes';
import NoteDetailsClient from './NoteDetails.client';

export const dynamic = 'force-dynamic';

interface NoteDetailsPageProps {
  params: Promise<{ id: string }>;
}

const APP_URL = 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

export async function generateMetadata({ params }: NoteDetailsPageProps): Promise<Metadata> {
  unstable_noStore();
  const { id } = await params;
  const canonicalPath = `/notes/${encodeURIComponent(id)}`;
  const url = `${APP_URL}${canonicalPath}`;
  try {
    const note = await fetchNoteById(id);
    const title = `Note: ${note.title}`;
    const description = note.content.slice(0, 100);
    return {
      title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: 'NoteHub',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: note.title }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [OG_IMAGE],
      },
      metadataBase: new URL(APP_URL),
    };
  } catch {
    const title = 'Note not found';
    const description = 'The requested note could not be found.';
    return {
      title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: 'NoteHub',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [OG_IMAGE],
      },
      metadataBase: new URL(APP_URL),
    };
  }
}

export default async function NoteDetailsPage({ params }: NoteDetailsPageProps) {
  unstable_noStore();
  const { id } = await params;
  const numericId = Number(id);
  const keyId = Number.isFinite(numericId) ? numericId : id;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['note', { id: keyId }],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
