"use client";

import { useMemo, useState } from "react";
import { useRegulationModal } from "@/context/RegulationModalContext";
import AlertCard from "./AlertCard";

export default function AlertsSection({ title, subtitle }: { title: string; subtitle?: string }) {
  const { regulations, regulatorFilters } = useRegulationModal();
  const [filter, setFilter] = useState("all");
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
  const list = activeFilter === "all" ? regulations : regulations.filter((regulation) => regulation.regulator === activeFilter);

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
        {list.map((r) => (
          <AlertCard key={r.id} regulation={r} />
        ))}
        {!list.length && activeFilter !== "all" && <p className="alerts-empty">No publications are available for this regulator in the current session. Select Save preferences to retry its scan.</p>}
      </div>
    </div>
  );
}
