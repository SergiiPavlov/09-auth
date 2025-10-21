import CreateNoteModalClient from './CreateNoteModal.client';
import { getCategories } from '@/lib/api';

export default async function CreateNoteModalPage() {
  const categories = await getCategories();
  return <CreateNoteModalClient categories={categories} />;
}
