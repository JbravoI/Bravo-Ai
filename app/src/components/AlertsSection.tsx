"use client";

import { useEffect, useMemo, useState } from "react";
import { useRegulationModal } from "@/context/RegulationModalContext";
import AlertCard from "./AlertCard";
import PaginationControls, { usePagination } from "./PaginationControls";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function AlertsSection({ title, subtitle, dashboardFilters = false, acknowledgeOnMount = false }: { title: string; subtitle?: string; dashboardFilters?: boolean; acknowledgeOnMount?: boolean }) {
  const { regulations, regulatorFilters, markAllRead } = useRegulationModal();
  const [filter, setFilter] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [deadline, setDeadline] = useState("all");
  const [deadlineBefore, setDeadlineBefore] = useState<number | null>(null);
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("newest");
  const regulators = useMemo(
    () => Array.from(new Set([...regulations.map((regulation) => regulation.regulator), ...regulatorFilters])).sort((a, b) => a.localeCompare(b)),
    [regulations, regulatorFilters],
  );
  const filters = [
    { value: "all", label: "All" },
    ...regulators.map((regulator) => ({
      value: regulator,
      // Prefer the common regulator abbreviation where the data supplies one,
      // keeping the country-scoped filter bar easy to scan.
      label: regulator.match(/\(([^)]+)\)$/)?.[1] ?? regulator,
    })),
  ];
  // A jurisdiction change can remove the previously selected regulator.
  // Resolve that stale selection to All without an extra state update/render.
  const activeFilter = filter === "all" || regulators.includes(filter) ? filter : "all";
  const tags = useMemo(() => Array.from(new Set(regulations.flatMap((regulation) => regulation.tags))).sort((a, b) => a.localeCompare(b)), [regulations]);
  const list = useMemo(() => regulations
    .filter((regulation) => activeFilter === "all" || regulation.regulator === activeFilter)
    .filter((regulation) => !dashboardFilters || priority === "all" || regulation.priority === priority)
    .filter((regulation) => !dashboardFilters || status === "all" || regulation.status === status)
    .filter((regulation) => !dashboardFilters || tag === "all" || regulation.tags.includes(tag))
    .filter((regulation) => {
      if (!dashboardFilters || deadline === "all") return true;
      if (deadline === "review") return regulation.status !== "implemented";
      const due = new Date(regulation.deadline);
      return deadlineBefore !== null && !Number.isNaN(due.valueOf()) && due.valueOf() <= deadlineBefore;
    })
    .sort((left, right) => {
      if (sort === "risk") return PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
      const direction = sort === "oldest" ? 1 : -1;
      return direction * (new Date(left.date).valueOf() - new Date(right.date).valueOf());
    }), [regulations, activeFilter, dashboardFilters, priority, status, tag, deadline, deadlineBefore, sort]);
  const pagination = usePagination(list, `${activeFilter}|${priority}|${status}|${deadline}|${deadlineBefore}|${tag}|${sort}`);

  useEffect(() => {
    if (acknowledgeOnMount) void markAllRead();
  }, [acknowledgeOnMount, markAllRead]);

  function clearDashboardFilters() {
    setFilter("all");
    setPriority("all");
    setStatus("all");
    setDeadline("all");
    setDeadlineBefore(null);
    setTag("all");
    setSort("newest");
  }

  return (
    <div>
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span className="section-title">{title}</span>
          {subtitle && <span className="section-sub">{subtitle}</span>}
        </div>
        <div className="filter-tabs">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`ftab ${activeFilter === f.value ? "active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="alerts-list">
        {dashboardFilters && <div className="alert-controls" aria-label="Dashboard alert filters">
          <label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="risk">Risk: high to low</option></select></label>
          <label>Risk <select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All risks</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
          <label>Status <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="pending">Pending</option><option value="implemented">Implemented</option></select></label>
          <label>Deadline <select value={deadline} onChange={(event) => { const value = event.target.value; setDeadline(value); setDeadlineBefore(value === "soon" ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null); }}><option value="all">Any deadline</option><option value="review">Needs review</option><option value="soon">Due within 30 days</option></select></label>
          <label>Industry <select value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">All industries</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="button" className="btn btn-ghost" onClick={clearDashboardFilters}>Clear filters</button>
        </div>}
        {pagination.pageItems.map((r) => (
          <AlertCard key={r.id} regulation={r} />
        ))}
        {!list.length && <p className="alerts-empty">{activeFilter !== "all" ? "No publications are available for this regulator in the current session. Select Save preferences to retry its scan." : "No publications match the selected filters."}</p>}
      </div>
      <PaginationControls page={pagination.page} pageSize={pagination.pageSize} totalItems={pagination.totalItems} totalPages={pagination.totalPages} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}
