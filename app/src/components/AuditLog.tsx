"use client";

import type { AuditEntry } from "@/lib/types";
import PaginationControls, { usePagination } from "./PaginationControls";

export default function AuditLog({ entries }: { entries: AuditEntry[] }) {
  const pagination = usePagination(entries, entries.map((entry) => `${entry.ts}-${entry.label}`).join(","));

  return (
    <div className="table-wrap" style={{ padding: "14px 18px" }}>
      {pagination.pageItems.map((entry, i) => (
        <div className="audit-line" key={`${entry.ts}-${entry.label}-${i}`}>
          <span className="audit-ts">{entry.ts}</span>
          <span className="audit-dot" />
          <span className="audit-text">
            <strong>{entry.label}</strong> – {entry.detail}
          </span>
        </div>
      ))}
      {!pagination.pageItems.length && <p className="alerts-empty">No audit activity has been recorded yet.</p>}
      <PaginationControls page={pagination.page} pageSize={pagination.pageSize} totalItems={pagination.totalItems} totalPages={pagination.totalPages} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}
