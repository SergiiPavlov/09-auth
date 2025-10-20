import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Note | NoteHub',
  description: 'Create a new note',
};

export default function NotesActionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
