'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/Modal/Modal';
import NotePreview from '@/components/NotePreview/NotePreview';
import { fetchNoteById } from '@/lib/api/notes';

interface NotePreviewClientProps {
  id: string;
}

export default function NotePreviewClient({ id }: NotePreviewClientProps) {
  const router = useRouter();

  const { data: note, isPending, error } = useQuery({
    queryKey: ['note', { id }],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const handleClose = () => router.back();

  return (
    <Modal isOpen onClose={handleClose}>
      {isPending ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Something went wrong.</p>
      ) : note ? (
        <NotePreview note={note} onClose={handleClose} />
      ) : (
        <p>Not found</p>
      )}
    </Modal>
  );
}
