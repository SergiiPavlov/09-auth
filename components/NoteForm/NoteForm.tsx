'use client';

import css from './NoteForm.module.css';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createNote, type NewNoteData } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { NoteTag } from '@/types/note';
import { useNoteDraftStore, initialDraft, type NoteDraft } from '@/lib/store/noteStore';

const TAGS: readonly NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

  const MIN_TITLE = 3;

export default function NoteForm({ categories }: { categories?: { id: string; name: string }[] }) {
  const categoriesOptions = (categories && categories.length)
    ? categories.map(c => ({ id: c.id, name: c.name }))
    : TAGS.map(t => ({ id: t.toLowerCase(), name: t }));
  const router = useRouter();
  const qc = useQueryClient();
  const draft = useNoteDraftStore((state) => state.draft);
  const setDraft = useNoteDraftStore((state) => state.setDraft);
  const clearDraft = useNoteDraftStore((state) => state.clearDraft);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // invalidate lists and details
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created');
      clearDraft();
      router.back();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement & { name: keyof NoteDraft };
    const fieldName = name as keyof NoteDraft;
    const nextValue = fieldName === 'tag' ? (value as NoteTag) : value;
    setDraft({ [fieldName]: nextValue } as Partial<NoteDraft>);
  };

  const handleFormAction = async (formData: FormData) => {
    const title = String(formData.get('title') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();
    const tag = String(formData.get('tag') ?? 'Todo') as NoteTag;

    if (!title) {
      toast.error('Title is required');
      return;
    }
    if (title.length < MIN_TITLE) {
      toast.error(`Title must be at least ${MIN_TITLE} characters`);
      return;
    }

    try {
      await mutateAsync({ title, content, categoryId: tag.toLowerCase() } as NewNoteData);
    } catch {
      // swallow error, toast handled in onError
    }
  };

  const handleCancel = () => {
    router.back(); // do not clear draft on cancel
  };

  const titleLen = (draft.title ?? initialDraft.title ?? '').trim().length;
  const titleInvalid = titleLen > 0 && titleLen < MIN_TITLE;

  return (
    <form className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={draft.title ?? initialDraft.title}
          onChange={handleChange}
          required
          minLength={MIN_TITLE}
          aria-invalid={titleInvalid ? true : undefined}
          aria-required="true"
        />
        {titleInvalid && (
          <p className={css.error}>Title must be at least {MIN_TITLE} characters.</p>
        )}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          className={css.textarea}
          value={draft.content ?? initialDraft.content}
          onChange={handleChange}
        />
</div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={draft.tag ?? initialDraft.tag}
          onChange={handleChange}
        >
          {categoriesOptions.map(opt => (
            <option key={opt.id} value={opt.id}>
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
