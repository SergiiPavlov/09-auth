import Link from 'next/link';
import { getCategories } from '@/lib/api';
import css from './SidebarNotes.module.css';

const TAGS = ['All', 'Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

export default async function SidebarNotes() {
  const categories = await getCategories();

  return (
    <nav aria-label="Filter notes by tag">
      <Link prefetch={false} href="/notes/action/create" className={css.menuLink}>Create note</Link>
      <ul className={css.menuList}>
        {TAGS.map((tag) => (
          <li key={tag} className={css.menuItem}>
            <Link prefetch={false} href={`/notes/filter/${encodeURIComponent(tag)}`} className={css.menuLink}>
              {tag === 'All' ? 'All notes' : tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
