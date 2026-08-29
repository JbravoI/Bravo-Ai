"use client";

import { useState } from "react";
import { JURISDICTIONS } from "@/lib/data";

export default function JuriGrid() {
  // Local UI state only — Phase 3 persists this per-user via /api/preferences.
  const [active, setActive] = useState(JURISDICTIONS.map((j) => j.active));

  return (
    <div className="juri-grid">
      {JURISDICTIONS.map((j, i) => (
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
