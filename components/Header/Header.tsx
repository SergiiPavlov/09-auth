'use client';
import Link from 'next/link';
import css from './Header.module.css';
import TagsMenu from '@/components/TagsMenu/TagsMenu';

export default function Header() {
  return (
    <header className={css.header}>
      <Link prefetch={false} href="/" aria-label="Home" className={css.headerLink}>
        NoteHub
      </Link>

      <nav aria-label="Main Navigation">
        <ul className={css.navigation}>
          <li className={css.navigationItem}>
            <Link prefetch={false} href="/" className={css.navigationLink}>
              Home
            </Link>
          </li>
          <li className={css.navigationItem}>
            <TagsMenu />
          </li>
        </ul>
      </nav>
    </header>
  );
}
