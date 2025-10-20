import Link from 'next/link';
import { getCategories } from '@/lib/api';
import css from './SidebarNotes.module.css';
import { paths } from '@/lib/paths';

const TAGS = ['All', 'Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

export default async function SidebarNotes() {
  const categories = await getCategories();

  return (
    <nav aria-label="Filter notes by tag">
      <Link prefetch={false} href={paths.notesActionCreate()} className={css.menuLink}>
        Create note
      </Link>
      <ul className={css.menuList}>
        {TAGS.map((tag) => (
          <li key={tag} className={css.menuItem}>
            <Link
              prefetch={false}
              href={
                tag === 'All'
                  ? paths.notesFilterAll()
                  : paths.notesFilterByTag(tag)
              }
              className={css.menuLink}
            >
              {tag === 'All' ? 'All notes' : tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
