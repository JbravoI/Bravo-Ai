"use client";

import { useMemo, useState } from "react";

const PAGE_SIZES = [10, 20, 30, 50] as const;

export function usePagination<T>(items: T[], resetKey = "") {
  const [state, setState] = useState({ page: 1, resetKey });
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Changing a filter changes resetKey. Deriving page one here avoids a
  // cascading state update during render while still resetting the view.
  const page = state.resetKey === resetKey ? Math.min(state.page, totalPages) : 1;

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    page,
    pageItems,
    pageSize,
    totalItems: items.length,
    totalPages,
    setPage: (nextPage: number) => setState({ page: Math.min(Math.max(1, nextPage), totalPages), resetKey }),
    setPageSize: (nextPageSize: (typeof PAGE_SIZES)[number]) => {
      setPageSize(nextPageSize);
      setState({ page: 1, resetKey });
    },
    resetPage: () => setState({ page: 1, resetKey }),
  };
}

export default function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: (typeof PAGE_SIZES)[number]) => void;
}) {
  const firstItem = totalItems ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="pagination" aria-label="List pagination">
      <p className="pagination-summary">Showing {firstItem}–{lastItem} of {totalItems}</p>
      <label className="pagination-size">
        <span>View</span>
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value) as (typeof PAGE_SIZES)[number])}>
          {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span>per page</span>
      </label>
      <div className="pagination-actions">
        <button type="button" className="btn btn-ghost" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Previous</button>
        <span aria-live="polite">Page {page} of {totalPages}</span>
        <button type="button" className="btn btn-ghost" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}
