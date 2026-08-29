"use client";

import { useState } from "react";

const INDUSTRIES = ["Banking", "Investment", "Insurance", "Asset Management", "Fintech"];

export default function PrefsIndustryFocus({ initialActive }: { initialActive: string[] }) {
  const [active, setActive] = useState<Set<string>>(new Set(initialActive));
  const [saving, setSaving] = useState(false);

  async function toggle(label: string) {
    const next = new Set(active);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setActive(next);

    setSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeIndustryFocus: Array.from(next) }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="filter-tabs" aria-busy={saving}>
      {INDUSTRIES.map((label) => (
        <button
          key={label}
          type="button"
          className={`ftab ${active.has(label) ? "active" : ""}`}
          aria-pressed={active.has(label)}
          onClick={() => toggle(label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
