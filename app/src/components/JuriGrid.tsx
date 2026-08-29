"use client";

import { useState } from "react";
import type { Jurisdiction } from "@/lib/types";

export default function JuriGrid({
  jurisdictions,
  initialActiveCodes,
}: {
  jurisdictions: Jurisdiction[];
  initialActiveCodes: string[];
}) {
  const [activeCodes, setActiveCodes] = useState<Set<string>>(new Set(initialActiveCodes));
  const [saving, setSaving] = useState(false);

  async function toggle(code: string) {
    const next = new Set(activeCodes);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setActiveCodes(next);

    setSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeJurisdictionCodes: Array.from(next) }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="juri-grid" aria-busy={saving}>
      {jurisdictions.map((j) => (
        <button
          key={j.code}
          type="button"
          className={`juri-pill ${activeCodes.has(j.code) ? "active" : ""}`}
          aria-pressed={activeCodes.has(j.code)}
          onClick={() => toggle(j.code)}
        >
          <span className="juri-dot" style={{ background: j.color }} />
          {j.code} – {j.label}
        </button>
      ))}
    </div>
  );
}
