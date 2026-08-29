"use client";

import { useState } from "react";
import QAPanel from "@/components/QAPanel";

const QUICK_QUESTIONS = [
  { label: "FCA Consumer Duty", value: "FCA Consumer Duty 2024" },
  { label: "PRA Capital", value: "PRA capital requirements" },
  { label: "DORA", value: "DORA operational resilience" },
  { label: "ESG Reporting", value: "ESG reporting requirements" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);

  function submitSearch() {
    if (query.trim()) setPrefill(query.trim());
  }

  return (
    <div className="page">
      <div className="section-title">Search &amp; AI Knowledge Base</div>
      <div className="search-box-wrap">
        <span className="search-icon">⌕</span>
        <input
          className="search-box"
          placeholder="Search regulations, policy papers, enforcement actions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch();
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q.value}
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQuery(q.value);
              setPrefill(q.value);
            }}
          >
            {q.label}
          </button>
        ))}
      </div>
      <QAPanel variant="search" prefill={prefill} onPrefillConsumed={() => setPrefill(undefined)} />
    </div>
  );
}
