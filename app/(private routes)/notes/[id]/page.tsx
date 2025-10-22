import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchNoteByIdServer } from '@/lib/api/serverApi';
import NoteDetailsClient from './NoteDetails.client';

export const dynamic = 'force-dynamic';

interface NoteDetailsPageProps {
  params: Promise<{ id: string }>;
}

// Use your real prod URL here if available via env.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

export async function generateMetadata({ params }: NoteDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const note = await fetchNoteByIdServer(id);
    const title = `Note: ${note.title}`;
    const description = note.content.slice(0, 100);

    const canonicalPath = `/notes/${id}`;
    const url = `${APP_URL}${canonicalPath}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description,
        url,
        images: [{ url: OG_IMAGE }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [OG_IMAGE],
      },
    };
  } catch {
    return {
      title: 'Note',
      description: 'Note details',
    };
  }
}

export default async function NoteDetailsPage({ params }: NoteDetailsPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  const keyId = Number.isFinite(numericId) ? numericId : id;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['note', { id: keyId }],
    queryFn: () => fetchNoteByIdServer(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
