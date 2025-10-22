'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api/clientApi';
import css from './NoteDetails.module.css';

export default function NoteDetailsClient() {
  const { id: rawId } = useParams<{ id: string }>();
  const idNum = Number(rawId);
  const keyId = Number.isFinite(idNum) ? idNum : rawId; // никакого NaN в ключах

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['note', { id: keyId }],
    queryFn: () => fetchNoteById(rawId),
    refetchOnMount: false, // в API передаём строковый id
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  // Состояния по ТЗ
  if (isLoading) return <p>Loading, please wait...</p>;
  if (error) return <p>Something went wrong.</p>;
  if (!note) return <p>Note not found.</p>;

  // ✅ Стабильное форматирование даты (без локали/таймзоны)
  const createdIso = new Date(note.createdAt).toISOString().slice(0, 10);
  // можно и так: new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(new Date(note.createdAt))

  return (
    <div className={css.container}>
      <div className={css.item}>
        <div className={css.header}>
          <h2>{note.title}</h2>
        </div>
        <p className={css.content}>{note.content}</p>
        <p className={css.date}>
          <time dateTime={note.createdAt}>{createdIso}</time>
        </p>
      </div>
    </div>
  );
}
