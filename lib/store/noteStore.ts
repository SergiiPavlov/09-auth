import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NoteTag } from '@/types/note';

export type NoteDraft = {
  title: string;
  content: string;
  tag: NoteTag;
};

type NoteDraftStore = {
  draft: NoteDraft;
  setDraft: (note: Partial<NoteDraft>) => void;
  clearDraft: () => void;
};

export const initialDraft: NoteDraft = {
  title: '',
  content: '',
  tag: 'Todo',
};

const createInitialDraft = (): NoteDraft => ({ ...initialDraft });

export const useNoteDraftStore = create<NoteDraftStore>()(
  persist(
    (set) => ({
      draft: createInitialDraft(),
      setDraft: (note) =>
        set((state) => ({
          draft: { ...state.draft, ...note },
        })),
      clearDraft: () => set(() => ({ draft: createInitialDraft() })),
    }),
    {
      name: 'notehub-note-draft',
      partialize: (state) => ({ draft: state.draft }),
    }
  )
);
