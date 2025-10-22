'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import css from './NoteForm.module.css';
import {
  createNote,
  getCategories,
  type CreateNoteBody,
  type NoteCategory,
} from '@/lib/api/clientApi';
import { getErrorMessage } from '@/lib/errors';
import type { NoteTag } from '@/types/note';
import { useNoteDraftStore, initialDraft, type NoteDraft } from '@/lib/store/noteStore';

const FALLBACK_TAGS: readonly NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;
const MIN_TITLE_LENGTH = 3;

interface NoteFormProps {
  categories?: NoteCategory[];
}

export default function NoteForm({ categories }: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteDraftStore();
  const [availableCategories, setAvailableCategories] = useState<NoteCategory[]>(categories ?? []);

  const fallbackCategories = useMemo<NoteCategory[]>(
    () => FALLBACK_TAGS.map((tag) => ({ id: tag.toLowerCase(), name: tag })),
    []
  );

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      if (categories?.length) {
        setAvailableCategories(categories);
        return;
      }

      try {
        const remoteCategories = await getCategories();
        if (!active) {
          return;
        }
        if (remoteCategories.length) {
          setAvailableCategories(remoteCategories);
        } else {
          setAvailableCategories(fallbackCategories);
        }
      } catch {
        if (active) {
          setAvailableCategories(fallbackCategories);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [categories, fallbackCategories]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: CreateNoteBody) => createNote(payload),
    onSuccess: async () => {
      toast.success('Note created');
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create note'));
    },
  });

  const currentDraft = { ...initialDraft, ...draft };

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > = (event) => {
    const { name, value } = event.target;
    setDraft({ [name]: value } as Partial<NoteDraft>);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = currentDraft.title?.trim() ?? '';
    const content = currentDraft.content?.trim() ?? '';
    const tag = currentDraft.tag ?? FALLBACK_TAGS[0];

    if (title.length < MIN_TITLE_LENGTH || !content) {
      toast.error('Please fill in title and content');
      return;
    }

    const payload: CreateNoteBody = {
      title,
      content,
      tag,
    };

    await mutateAsync(payload);
  };

  const handleCancel = () => {
    router.back();
  };

  const categoriesToRender = availableCategories.length
    ? availableCategories
    : fallbackCategories;

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.field}>
        <label htmlFor="title" className={css.label}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={currentDraft.title ?? ''}
          onChange={handleChange}
          minLength={MIN_TITLE_LENGTH}
          required
          placeholder="Enter title"
        />
      </div>

      <div className={css.field}>
        <label htmlFor="content" className={css.label}>
          Content
        </label>
        <textarea
          id="content"
          name="content"
          className={css.textarea}
          value={currentDraft.content ?? ''}
          onChange={handleChange}
          required
          placeholder="Write your note..."
        />
      </div>

      <div className={css.field}>
        <label htmlFor="tag" className={css.label}>
          Tag
        </label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={currentDraft.tag ?? FALLBACK_TAGS[0]}
          onChange={handleChange}
        >
          {categoriesToRender.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button type="submit" disabled={isPending} className={css.submitButton}>
          {isPending ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={handleCancel} className={css.cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}
