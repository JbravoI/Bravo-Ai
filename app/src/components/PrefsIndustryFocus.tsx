"use client";

import { useState } from "react";

const INDUSTRIES = ["Banking", "Investment", "Insurance", "Asset Management", "Fintech"];

export default function PrefsIndustryFocus() {
  // Local UI state only — Phase 3 persists this per-user via /api/preferences.
  const [active, setActive] = useState<Set<string>>(new Set(["Banking", "Investment"]));

  return (
    <div className="filter-tabs">
      {INDUSTRIES.map((label) => (
        <button
          key={label}
          type="button"
          className={`ftab ${active.has(label) ? "active" : ""}`}
          aria-pressed={active.has(label)}
          onClick={() =>
            setActive((prev) => {
              const next = new Set(prev);
              if (next.has(label)) next.delete(label);
              else next.add(label);
              return next;
            })
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
