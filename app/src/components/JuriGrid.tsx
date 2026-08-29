"use client";

import { useState } from "react";
import type { Jurisdiction } from "@/lib/types";

export default function JuriGrid({ jurisdictions }: { jurisdictions: Jurisdiction[] }) {
  // Local UI state only — Phase 3 persists this per-user via /api/preferences.
  const [active, setActive] = useState(jurisdictions.map((j) => j.active));

  return (
    <div className="juri-grid">
      {jurisdictions.map((j, i) => (
        <button
          key={j.code}
          type="button"
          className={`juri-pill ${active[i] ? "active" : ""}`}
          aria-pressed={active[i]}
          onClick={() => setActive((a) => a.map((v, idx) => (idx === i ? !v : v)))}
        >
          <span className="juri-dot" style={{ background: j.color }} />
          {j.code} – {j.label}
        </button>
      ))}
    </div>
  );
}
