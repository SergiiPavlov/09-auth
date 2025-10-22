import type { Metadata } from 'next';
import { unstable_noStore } from 'next/cache';
import NotesClient from './Notes.client';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchNotesServer } from '@/lib/api/serverApi';
import type { NoteTag } from '@/types/note';
type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = 'force-dynamic';

const FILTERABLE_TAGS: readonly NoteTag[] = [
  'Todo',
  'Work',
  'Personal',
  'Meeting',
  'Shopping',
] as const;
const ALL_TAG = 'All';
const APP_URL = 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

function normalizeTag(value?: string): NoteTag | 'All' {
  if (!value) {
    return ALL_TAG;
  }

  if (value.toLowerCase() === ALL_TAG.toLowerCase()) {
    return ALL_TAG;
  }

  const matchingTag = FILTERABLE_TAGS.find((tag) => tag.toLowerCase() === value.toLowerCase());
  return matchingTag ?? ALL_TAG;
}


type NotesFilterPageProps = { params: Promise<{ slug?: string[] }> };


export async function generateMetadata({ params }: NotesFilterPageProps): Promise<Metadata> {
  unstable_noStore();
  const { slug = [] } = await params;
  const rawTag = Array.isArray(slug) && slug.length ? slug[0] : ALL_TAG;
  const tag = normalizeTag(rawTag);
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
  const { slug = [] } = await params;
  const rawTag = Array.isArray(slug) && slug.length ? slug[0] : ALL_TAG;
  const initialTag = normalizeTag(rawTag);
  const tagForQuery = initialTag === ALL_TAG ? '' : initialTag;

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['notes', { search: '', tag: tagForQuery, page: 1, perPage: 12 }],
    queryFn: () =>
      fetchNotesServer({
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