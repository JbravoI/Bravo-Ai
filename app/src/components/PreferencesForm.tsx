"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Jurisdiction } from "@/lib/types";
import { OPTIONAL_NIGERIA_REGULATORS, type OptionalNigeriaRegulatorCode } from "@/lib/optional-nigeria-regulators";

const INDUSTRIES = ["Banking", "Investment", "Insurance", "Asset Management", "Fintech"];

export default function PreferencesForm({
  jurisdictions,
  initialJurisdictionCode,
  initialIndustryFocus,
  initialOptionalNigeriaRegulatorCodes,
}: {
  jurisdictions: Jurisdiction[];
  initialJurisdictionCode: string;
  initialIndustryFocus: string[];
  initialOptionalNigeriaRegulatorCodes: OptionalNigeriaRegulatorCode[];
}) {
  const router = useRouter();
  const [jurisdictionCode, setJurisdictionCode] = useState(initialJurisdictionCode);
  const [industryFocus, setIndustryFocus] = useState<Set<string>>(new Set(initialIndustryFocus));
  const [optionalNigeriaRegulators, setOptionalNigeriaRegulators] = useState<Set<OptionalNigeriaRegulatorCode>>(new Set(initialOptionalNigeriaRegulatorCodes));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshRequested, setRefreshRequested] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  useEffect(() => {
    if (!refreshRequested || isRefreshing) return;
    const timer = window.setTimeout(() => {
      setMessage("Preferences saved ✓");
      setRefreshRequested(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isRefreshing, refreshRequested]);

  function toggleIndustry(label: string) {
    setIndustryFocus((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  function toggleOptionalNigeriaRegulator(code: OptionalNigeriaRegulatorCode) {
    setOptionalNigeriaRegulators((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeJurisdictionCodes: [jurisdictionCode], activeIndustryFocus: Array.from(industryFocus), optionalNigeriaRegulatorCodes: Array.from(optionalNigeriaRegulators) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not save preferences.");
      setMessage(data?.optionalScan?.completed?.length ? "Preferences saved. Scanning your selected regulators…" : "Preferences saved. Updating your view…");
      setRefreshRequested(true);
      startRefresh(() => router.refresh());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save preferences.");
    } finally { setSaving(false); }
  }

  return <div className="prefs-form">
    <div className="prefs-save-row"><div><div className="modal-section-title">Jurisdiction</div><p className="prefs-help">Choose one jurisdiction to view at a time.</p></div><button className="btn btn-primary prefs-save" type="button" onClick={save} disabled={saving || isRefreshing} aria-label="Save preferences">{saving ? "Saving…" : isRefreshing ? "Updating…" : "💾 Save preferences"}</button></div>
    <div className="juri-grid" role="radiogroup" aria-label="Jurisdiction">
      {jurisdictions.map((jurisdiction) => <button key={jurisdiction.code} type="button" className={`juri-pill ${jurisdictionCode === jurisdiction.code ? "active" : ""}`} role="radio" aria-checked={jurisdictionCode === jurisdiction.code} onClick={() => setJurisdictionCode(jurisdiction.code)}><span className="juri-dot" style={{ background: jurisdiction.color }} />{jurisdiction.code} – {jurisdiction.label}</button>)}
    </div>
    {jurisdictionCode === "NG" && <div><div className="modal-section-title">Optional Nigeria Regulatory Bodies</div><p className="prefs-help">Select the bodies you want to monitor. Saving fetches data only for your current session; it is removed when you sign out.</p><div className="filter-tabs">{OPTIONAL_NIGERIA_REGULATORS.map((regulator) => <button key={regulator.code} type="button" className={`ftab ${optionalNigeriaRegulators.has(regulator.code) ? "active" : ""}`} aria-pressed={optionalNigeriaRegulators.has(regulator.code)} onClick={() => toggleOptionalNigeriaRegulator(regulator.code)}>{regulator.label}</button>)}</div></div>}
    <div><div className="modal-section-title">Industry Focus</div><div className="filter-tabs">{INDUSTRIES.map((label) => <button key={label} type="button" className={`ftab ${industryFocus.has(label) ? "active" : ""}`} aria-pressed={industryFocus.has(label)} onClick={() => toggleIndustry(label)}>{label}</button>)}</div></div>
    {message && <p className="prefs-message" role="status">{message}</p>}
    <p className="prefs-help">Alert delivery controls are not active yet. This save applies your jurisdiction and industry focus.</p>
  </div>;
}
