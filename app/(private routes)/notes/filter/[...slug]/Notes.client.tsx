'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import css from '../NotesPage.module.css';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import { fetchNotes, type FetchNotesResponse } from '@/lib/api/clientApi';
import type { NoteTag } from '@/types/note';

const PER_PAGE = 12;
const TAGS: readonly (NoteTag | 'All')[] = [
  'All',
  'Todo',
  'Work',
  'Personal',
  'Meeting',
  'Shopping',
] as const;

export default function NotesClient({ initialTag = 'All' }: { initialTag?: NoteTag | 'All' }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState<NoteTag | 'All'>(initialTag);

  useEffect(() => {
    setTag(initialTag);
    setPage(1);
    setSearch('');
  }, [initialTag]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tag]);

  const tagForQuery = useMemo<string>(() => {
    const normalizedTag = TAGS.includes(tag) ? tag : 'All';
    return normalizedTag === 'All' ? '' : normalizedTag;
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
  const hasNotes = (data?.notes?.length ?? 0) > 0;

  const handlePageChange = (next: number) => setPage(next);
  const handleTagChange = (nextTag: string) => {
    const normalizedTag = TAGS.includes(nextTag as NoteTag | 'All')
      ? (nextTag as NoteTag | 'All')
      : 'All';
    setTag(normalizedTag);
  };

  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        <SearchBox value={search} onChange={setSearch} />
        <div className={css.toolbarActions}>
          <label className={css.selectLabel}>
            <span className={css.selectLabelText}>Tag</span>
            <select
              className={css.select}
              value={tag}
              onChange={(event) => handleTagChange(event.target.value)}
            >
              {TAGS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All notes' : option}
                </option>
              ))}
            </select>
          </label>

          <Link prefetch={false} href="/notes/action/create" className={css.button}>
            Create note +
          </Link>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {isPending && !isPlaceholderData && <p>Loading, please wait...</p>}
      {error && (
        <p>
          Could not fetch the list of notes.
          {error instanceof Error ? ` ${error.message}` : ''}
        </p>
      )}

      {!isPending && !error && !hasNotes && <p>No notes found.</p>}
      <NoteList notes={data?.notes ?? []} />
    </div>
  );
}