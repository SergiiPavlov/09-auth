'use client';

import ReactPaginate from 'react-paginate';
import css from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <ReactPaginate
      className={css.pagination}
      pageClassName={css.pageItem}
      pageLinkClassName={css.pageLink}
      activeClassName={css.active}
      previousLabel="<"
      nextLabel=">"
      breakLabel="…"
      pageCount={totalPages}
      forcePage={Math.max(0, (currentPage ?? 1) - 1)}
      onPageChange={({ selected }) => onPageChange(selected + 1)}
      previousClassName={css.pageItem}
      previousLinkClassName={css.pageLink}
      nextClassName={css.pageItem}
      nextLinkClassName={css.pageLink}
      breakClassName={css.pageItem}
      breakLinkClassName={css.pageLink}
    />
  );
}
