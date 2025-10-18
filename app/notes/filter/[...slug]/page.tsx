import type { Metadata } from 'next';
import { unstable_noStore } from 'next/cache';
import NotesClient from './Notes.client';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api/notes';
import type { NoteTag } from '@/types/note';

export const dynamic = 'force-dynamic';

const FILTERABLE_TAGS: readonly NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;
const ALL_TAG = 'All';
const APP_URL = 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

function resolveTagFromSlug(slug?: string): { tag: string; tagForQuery?: NoteTag } {
  if (!slug) {
    return { tag: ALL_TAG, tagForQuery: undefined };
  }

  const matchingTag = FILTERABLE_TAGS.find((tag) => tag.toLowerCase() === slug.toLowerCase());
  if (matchingTag) {
    return { tag: matchingTag, tagForQuery: matchingTag };
  }

  if (slug.toLowerCase() === ALL_TAG.toLowerCase()) {
    return { tag: ALL_TAG, tagForQuery: undefined };
  }

  return { tag: ALL_TAG, tagForQuery: undefined };
}

interface NotesFilterPageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({ params }: NotesFilterPageProps): Promise<Metadata> {
  unstable_noStore();
  const { slug = [] } = (await params) ?? {};
  const rawValue = slug[0];
  const { tag } = resolveTagFromSlug(rawValue);
  const isAll = tag === ALL_TAG;
  const pageTitle = isAll ? 'All notes' : `Notes tagged: ${tag}`;
  const description = isAll ? 'Browse all notes' : `Browse notes filtered by tag: ${tag}`;
  const slugSegment = isAll ? ALL_TAG : tag;
  const canonicalPath = `/notes/filter/${encodeURIComponent(slugSegment)}`;
  const url = `${APP_URL}${canonicalPath}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: 'NoteHub',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: pageTitle }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [OG_IMAGE],
    },
    metadataBase: new URL(APP_URL),
  };
}

export default async function NotesFilterPage({ params }: NotesFilterPageProps) {
  unstable_noStore();
  const { slug = [] } = (await params) ?? {};
  const rawValue = slug[0];
  const { tag: initialTag, tagForQuery } = resolveTagFromSlug(rawValue);

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['notes', { search: '', tag: tagForQuery, page: 1, perPage: 12 }],
    queryFn: () =>
      fetchNotes({
        search: '',
        page: 1,
        perPage: 12,
        tag: tagForQuery,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialTag={initialTag} />
    </HydrationBoundary>
  );
}
