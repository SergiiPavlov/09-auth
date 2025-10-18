'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import css from './NoteList.module.css';
import type { Note } from '@/types/note';
import { deleteNote } from '@/lib/api/notes';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';

export interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete note'));
    },
  });

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}>{n.title}</h2>
          <p className={css.content}>{n.content ?? ''}</p>
          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>
            <Link prefetch={false} className={css.link} href={`/notes/${n.id}`}>View details</Link>
            <button
              className={css.button}
              onClick={() => del.mutate(n.id)}
              disabled={del.isPending}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}