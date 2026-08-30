"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Jurisdiction } from "@/lib/types";

const INDUSTRIES = ["Banking", "Investment", "Insurance", "Asset Management", "Fintech"];

export default function PreferencesForm({
  jurisdictions,
  initialJurisdictionCode,
  initialIndustryFocus,
}: {
  jurisdictions: Jurisdiction[];
  initialJurisdictionCode: string;
  initialIndustryFocus: string[];
}) {
  const router = useRouter();
  const [jurisdictionCode, setJurisdictionCode] = useState(initialJurisdictionCode);
  const [industryFocus, setIndustryFocus] = useState<Set<string>>(new Set(initialIndustryFocus));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleIndustry(label: string) {
    setIndustryFocus((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeJurisdictionCodes: [jurisdictionCode], activeIndustryFocus: Array.from(industryFocus) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not save preferences.");
      setMessage("Preferences saved. Refreshing…");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save preferences.");
    } finally { setSaving(false); }
  }

  return <div className="prefs-form">
    <div className="prefs-save-row"><div><div className="modal-section-title">Jurisdiction</div><p className="prefs-help">Choose one jurisdiction to view at a time.</p></div><button className="btn btn-primary prefs-save" type="button" onClick={save} disabled={saving} aria-label="Save preferences">{saving ? "Saving…" : "💾 Save preferences"}</button></div>
    <div className="juri-grid" role="radiogroup" aria-label="Jurisdiction">
      {jurisdictions.map((jurisdiction) => <button key={jurisdiction.code} type="button" className={`juri-pill ${jurisdictionCode === jurisdiction.code ? "active" : ""}`} role="radio" aria-checked={jurisdictionCode === jurisdiction.code} onClick={() => setJurisdictionCode(jurisdiction.code)}><span className="juri-dot" style={{ background: jurisdiction.color }} />{jurisdiction.code} – {jurisdiction.label}</button>)}
    </div>
    <div><div className="modal-section-title">Industry Focus</div><div className="filter-tabs">{INDUSTRIES.map((label) => <button key={label} type="button" className={`ftab ${industryFocus.has(label) ? "active" : ""}`} aria-pressed={industryFocus.has(label)} onClick={() => toggleIndustry(label)}>{label}</button>)}</div></div>
    {message && <p className="prefs-message" role="status">{message}</p>}
    <p className="prefs-help">Alert delivery controls are not active yet. This save applies your jurisdiction and industry focus.</p>
  </div>;
}
