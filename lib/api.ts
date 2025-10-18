import { createNote as _createNote } from './api/notes';
// HW-08 compatibility: expose the API surface at lib/api.ts as required by the validator.
// The actual implementations live in ./api/notes.ts and are fully typed.
export type { Note, NoteTag } from '@/types/note';
export type { FetchNotesResponse } from './api/notes';
export {fetchNotes, fetchNoteById, updateNote, deleteNote} from './api/notes';

// ---- Lecture-compatible API surface ----
export type Category = { id: string; name: string };

export type NewNoteData = {
  title: string;
  content: string;
  categoryId: string;
};

export async function getCategories(): Promise<Category[]> {
  const tags = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];
  return tags.map(t => ({ id: t.toLowerCase(), name: t }));
}

export async function createNote(data: NewNoteData) {
  const { title, content, categoryId } = data;
  const tag = (categoryId.charAt(0).toUpperCase() + categoryId.slice(1)) as any;
  return await _createNote({ title, content, tag } as any);
}
// ---- End lecture-compatible API ----
