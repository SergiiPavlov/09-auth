'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import css from './TagsMenu.module.css';
import type { NoteTag } from '@/types/note';

const NOTE_TAGS: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];
const ALL_TAG = 'All';

export default function TagsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const menuId = `${baseId}-menu`;
  const buttonId = `${baseId}-button`;
  const tags: (NoteTag | typeof ALL_TAG)[] = [ALL_TAG, ...NOTE_TAGS];

  // Автозакрытие при смене маршрута
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Закрытие по клику вне меню и по Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={css.menuContainer} ref={containerRef}>
      <button
        id={buttonId}
        type="button"
        className={css.menuButton}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen(prev => !prev)}
      >
        Notes ▾
      </button>

      {isOpen && (
        <ul
          id={menuId}
          className={css.menuList}
          role="menu"
          aria-labelledby={buttonId}
        >
          {tags.map(tag => (
            <li key={tag} className={css.menuItem} role="none">
              <Link prefetch={false}
                href={
                  tag === ALL_TAG
                    ? '/notes/filter/All'
                    : `/notes/filter/${encodeURIComponent(String(tag))}`
                }
                className={css.menuLink}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {tag === ALL_TAG ? 'All notes' : tag}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
