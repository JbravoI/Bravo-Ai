"use client";

import { useMemo, useState } from "react";
import type { ImpactLevel, ImpactRow } from "@/lib/types";
import PaginationControls, { usePagination } from "./PaginationControls";

const COLOR: Record<ImpactLevel, string> = {
  High: "var(--danger)",
  Medium: "var(--warn)",
  Low: "var(--success)",
  None: "var(--text3)",
};

const AREAS = [
  ["banking", "Banking"],
  ["invest", "Investment"],
  ["insure", "Insurance"],
  ["comp", "Compliance"],
  ["ops", "Operations"],
] as const;

const LEVEL_ORDER: Record<ImpactLevel, number> = { High: 3, Medium: 2, Low: 1, None: 0 };
type AreaKey = (typeof AREAS)[number][0];

function impactsFor(row: ImpactRow, area: AreaKey | "all") {
  return area === "all"
    ? [row.banking, row.invest, row.insure, row.comp, row.ops]
    : [row[area]];
}

export default function ImpactTable({ rows }: { rows: ImpactRow[] }) {
  const [area, setArea] = useState<AreaKey | "all">("all");
  const [minimumImpact, setMinimumImpact] = useState<ImpactLevel | "all">("all");
  const [sort, setSort] = useState("regulation");
  const list = useMemo(() => rows
    .filter((row) => minimumImpact === "all" || impactsFor(row, area).some((impact) => LEVEL_ORDER[impact] >= LEVEL_ORDER[minimumImpact]))
    .sort((left, right) => {
      if (sort === "highest") return Math.max(...impactsFor(right, area).map((impact) => LEVEL_ORDER[impact])) - Math.max(...impactsFor(left, area).map((impact) => LEVEL_ORDER[impact]));
      if (sort === "coverage") return impactsFor(right, area).filter((impact) => impact !== "None").length - impactsFor(left, area).filter((impact) => impact !== "None").length;
      return left.reg.localeCompare(right.reg);
    }), [rows, area, minimumImpact, sort]);
  const pagination = usePagination(list, `${area}|${minimumImpact}|${sort}`);

  function clearFilters() {
    setArea("all");
    setMinimumImpact("all");
    setSort("regulation");
  }

  return (
    <div>
      <div className="impact-controls" aria-label="Impact map filters">
        <label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="regulation">Regulation A–Z</option><option value="highest">Highest impact first</option><option value="coverage">Most affected areas first</option></select></label>
        <label>Business area <select value={area} onChange={(event) => setArea(event.target.value as AreaKey | "all")}><option value="all">All areas</option>{AREAS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Minimum impact <select value={minimumImpact} onChange={(event) => setMinimumImpact(event.target.value as ImpactLevel | "all")}><option value="all">Any impact</option><option value="High">High</option><option value="Medium">Medium or higher</option><option value="Low">Low or higher</option></select></label>
        <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Regulation</th>
              <th>Banking</th>
              <th>Investment</th>
              <th>Insurance</th>
              <th>Compliance</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((row) => (
              <tr key={row.reg}>
                <td style={{ color: "var(--text)", fontSize: 11 }}>{row.reg}</td>
                {[row.banking, row.invest, row.insure, row.comp, row.ops].map((v, i) => (
                  <td key={i} style={{ color: COLOR[v], fontFamily: "var(--fm)", fontSize: 10 }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
            {!pagination.pageItems.length && <tr><td colSpan={6}>No regulations match the selected impact filters.</td></tr>}
          </tbody>
        </table>
        <PaginationControls page={pagination.page} pageSize={pagination.pageSize} totalItems={pagination.totalItems} totalPages={pagination.totalPages} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
      </div>
    </div>
  );
}
