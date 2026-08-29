"use client";

import { useState } from "react";
import { REGULATIONS } from "@/lib/data";
import type { Source } from "@/lib/types";
import AlertCard from "./AlertCard";

type FilterValue = "all" | Source;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fca", label: "FCA" },
  { value: "pra", label: "PRA" },
  { value: "hmt", label: "HM Treasury" },
  { value: "eu", label: "EU/Global" },
];

export default function AlertsSection({ title, subtitle }: { title: string; subtitle?: string }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const list = filter === "all" ? REGULATIONS : REGULATIONS.filter((r) => r.source === filter);

  return (
    <div>
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span className="section-title">{title}</span>
          {subtitle && <span className="section-sub">{subtitle}</span>}
        </div>
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`ftab ${filter === f.value ? "active" : ""}`}
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
      </div>
    </div>
  );
}
