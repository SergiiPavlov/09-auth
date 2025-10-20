import { api } from '@/lib/api/api';
import type { NoteTag } from '@/types/note';

export type NewNoteData = {
  title: string;
  content: string;
  tag: NoteTag;
};

/**
 * Create a new note (cookie-auth required).
 */
export async function createNote(data: NewNoteData) {
  const res = await api.post('/notes', {
    title: data.title,
    content: data.content,
    tag: data.tag, // must be one of: 'Todo' | 'Work' | 'Personal' | 'Meeting' | 'Shopping'
  });
  return res.data;
}

/**
 * Categories helper used by sidebar/create pages.
 * If backend does not provide categories, we fallback to static tags.
 */
export async function getCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await api.get('/notes/categories');
    const items = (res.data?.items ?? res.data?.categories ?? res.data) as any;
    if (Array.isArray(items) && items.length && items[0]?.id && items[0]?.name) {
      return items as { id: string; name: string }[];
    }
  } catch {}
  // Fallback to fixed tag set
  const tags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];
  return tags.map((t) => ({ id: t.toLowerCase(), name: t }));
}
