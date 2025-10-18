'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import css from './NotesPage.module.css';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import { fetchNotes, type FetchNotesResponse } from '@/lib/api/notes';
import type { NoteTag } from '@/types/note';

const PER_PAGE = 12;
const TAGS: readonly (NoteTag | 'All')[] = ['All', 'Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

export default function NotesClient({ initialTag = 'All' }: { initialTag?: string }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState<string>(initialTag);

  useEffect(() => {
    setTag(initialTag);
    setPage(1);
    setSearch('');
  }, [initialTag]);

  const tagForQuery = useMemo<NoteTag | undefined>(() => {
    return TAGS.includes(tag as any) && tag !== 'All' ? (tag as NoteTag) : undefined;
  }, [tag]);

  const { data, error, isPending, isPlaceholderData } = useQuery<FetchNotesResponse>({
    queryKey: ['notes', { search: debouncedSearch, tag: tagForQuery, page, perPage: PER_PAGE }],
    queryFn: () =>
      fetchNotes({ search: debouncedSearch, tag: tagForQuery, page, perPage: PER_PAGE }),
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (next: number) => setPage(next);

  return (
    <div className={css.app}>      <div className={css.toolbar}>
        <SearchBox value={search} onChange={setSearch} />

        <Link prefetch={false} href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {isPending && <p>Loading, please wait...</p>}
      {error && (
        <p>
          Could not fetch the list of notes.
          {error instanceof Error ? ` ${error.message}` : ''}
        </p>
      )}

      <NoteList notes={data?.notes ?? []} />
    </div>
  );
}
