import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Create Note | NoteHub',
  description: 'Create a new note',
};

export default function NotesActionLayout({ children }: { children: ReactNode }) {
  return children;
}
