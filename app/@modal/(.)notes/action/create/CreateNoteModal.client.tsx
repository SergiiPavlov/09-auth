'use client';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';

interface Props { categories?: { id: string; name: string }[] }

export default function CreateNoteModalClient({ categories }: Props) {
  const router = useRouter();
  return (
    <Modal isOpen onClose={() => router.back()}>
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Create note</h2>
      <NoteForm categories={categories} />
    </Modal>
  );
}
