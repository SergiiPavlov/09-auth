import css from './NotePreview.module.css';
import type { Note } from '@/types/note';

interface NotePreviewProps {
  note: Note;
  onClose: () => void;
}

export default function NotePreview({ note, onClose }: NotePreviewProps) {
  const createdDate = new Date(note.createdAt);
  const formattedDate = Number.isNaN(createdDate.getTime())
    ? note.createdAt
    : createdDate.toLocaleDateString('en-CA');

  return (
    <div className={css.container}>
      <div className={css.item}>
        <div className={css.header}>
          <h2>{note.title}</h2>
          <span className={css.tag}>{note.tag}</span>
        </div>
        <p className={css.content}>{note.content || 'No content'}</p>
        <p className={css.date}>
          <time dateTime={note.createdAt}>{formattedDate}</time>
        </p>
        <button type="button" className={css.backBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
