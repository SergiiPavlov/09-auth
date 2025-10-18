import type { Metadata } from 'next';
import css from './not-found.module.css';

const APP_URL = 'https://notehub.example';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';
const PAGE_PATH = '/404';

export const metadata = {
  title: '404 – Page not found',
  description: 'The page you are looking for does not exist.',
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: '404 – Page not found',
    description: 'The page you are looking for does not exist.',
    url: `${APP_URL}${PAGE_PATH}`,
    siteName: 'NoteHub',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: '404 Not Found' }],
    type: 'website',
  },
  metadataBase: new URL(APP_URL),
} satisfies Metadata;

export default function NotFound() {
  return (
    <div className={css.container}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}
