'use client';

import css from './NoteForm.module.css';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createNote, type NewNoteData, getCategories } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { NoteTag } from '@/types/note';
import { useEffect, useMemo, useState } from 'react';
import { useNoteDraftStore, initialDraft, type NoteDraft } from '@/lib/store/noteStore';

const TAGS: readonly NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;
const MIN_TITLE = 3;

type Props = { categories?: { id: string; name: string }[] };

export default function NoteForm({ categories }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteDraftStore();

  // Fallback categories from TAGS if none provided
  const fallbackCategories = useMemo(
    () => TAGS.map((t) => ({ id: t.toLowerCase(), name: t })),
    []
  );
  const [cats, setCats] = useState<{ id: string; name: string }[]>(categories ?? fallbackCategories);

  useEffect(() => {
    let mounted = true;
    if (!categories) {
      getCategories().then((list) => {
        if (mounted && Array.isArray(list) && list.length) setCats(list);
      }).catch(() => {});
    }
    return () => { mounted = false; };
  }, [categories]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: NewNoteData) => createNote(payload),
    onSuccess: async () => {
      toast.success('Note created');
      clearDraft();
      await qc.invalidateQueries({ queryKey: ['notes'] });
      router.refresh();
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to create note'));
    },
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target as HTMLInputElement;
    setDraft({ [name]: value } as Partial<NoteDraft>);
  };

  const handleCancel = () => {
    clearDraft();
    router.back();
  };

  const handleFormAction = async () => {
    const title = draft.title?.trim() ?? '';
    const content = draft.content?.trim() ?? '';
    const tag = draft.tag ?? 'Todo';
    if (title.length < MIN_TITLE || !content) {
      toast.error('Please fill in title and content');
      return;
    }
    await mutateAsync({ title, content, tag });
  };

  const current = { ...initialDraft, ...draft };

  return (
    <form className={css.form}>
      <div className={css.field}>
        <label htmlFor="title" className={css.label}>Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={current.title}
          onChange={handleChange}
          required
          minLength={MIN_TITLE}
          placeholder="Enter title"
        />
      </div>

      <div className={css.field}>
        <label htmlFor="content" className={css.label}>Content</label>
        <textarea
          id="content"
          name="content"
          className={css.textarea}
          value={current.content}
          onChange={handleChange}
          required
          placeholder="Write your note..."
        />
      </div>

      <div className={css.field}>
        <label htmlFor="tag" className={css.label}>Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={current.tag ?? 'Todo'}
          onChange={handleChange}
        >
          {cats.map((opt) => (
            <option key={opt.id} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="submit"
          disabled={isPending}
          className={css.submitButton}
          formAction={handleFormAction}
        >
          {isPending ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={handleCancel} className={css.cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}
