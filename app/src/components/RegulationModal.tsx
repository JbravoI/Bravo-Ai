"use client";

import { useEffect, useRef, useState } from "react";
import { useRegulationModal } from "@/context/RegulationModalContext";
import { formatDate, formatDateTime } from "@/lib/dates";
import type { ComplianceAssessment, ComplianceAssessmentStatus } from "@/lib/types";

const ASSESSMENT_STATUS_LABEL: Record<ComplianceAssessmentStatus, string> = { not_started: "Not started", in_progress: "In progress", blocked: "Blocked", complete: "Complete" };

function ComplianceAssessmentPanel({ regulationId, assessment, canAssess }: { regulationId: number; assessment?: ComplianceAssessment; canAssess: boolean }) {
  const { saveComplianceAssessment } = useRegulationModal();
  const [owner, setOwner] = useState(assessment?.owner ?? "");
  const [assessmentStatus, setAssessmentStatus] = useState<ComplianceAssessmentStatus>(assessment?.assessmentStatus ?? "not_started");
  const [readiness, setReadiness] = useState(String(assessment?.readiness ?? 0));
  const [evidenceReference, setEvidenceReference] = useState(assessment?.evidenceReference ?? "");
  const [rationale, setRationale] = useState(assessment?.rationale ?? "");
  const [nextReviewAt, setNextReviewAt] = useState(assessment?.nextReviewAt ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      await saveComplianceAssessment({ regulationId, owner, assessmentStatus, readiness: Number(readiness), evidenceReference, rationale, nextReviewAt });
      setMessage("Assessment saved. The compliance score and readiness table are updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save assessment.");
    } finally { setSaving(false); }
  }

  return <div className="modal-section compliance-assessment">
    <div className="modal-section-title">Compliance assessment</div>
    {assessment && <p className="assessment-history">Latest assessment: {assessment.readiness}% · {ASSESSMENT_STATUS_LABEL[assessment.assessmentStatus]} · recorded by {assessment.assessedBy} on {formatDateTime(assessment.assessedAt)}.</p>}
    {!canAssess ? <p className="modal-body">{regulationId < 0 ? "Session-only optional regulator records cannot have a persistent compliance assessment." : "Your viewer role can review the latest assessment but cannot record or change it."}</p> : <form onSubmit={submit}>
      <div className="assessment-grid"><label>Owner<input required minLength={2} maxLength={120} value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Responsible owner" /></label><label>Assessment status<select value={assessmentStatus} onChange={(event) => setAssessmentStatus(event.target.value as ComplianceAssessmentStatus)}>{Object.entries(ASSESSMENT_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Readiness %<input required type="number" min="0" max="100" step="1" value={readiness} onChange={(event) => setReadiness(event.target.value)} /></label><label>Next review date<input type="date" value={nextReviewAt} onChange={(event) => setNextReviewAt(event.target.value)} /></label></div>
      <label className="assessment-field">Evidence reference or URL<input maxLength={500} value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} placeholder="Policy, ticket, document or URL" /></label>
      <label className="assessment-field">Rationale<textarea required minLength={2} maxLength={2000} value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Why this readiness level is appropriate" /></label>
      {message && <p className="assessment-message" role="status">{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Record assessment"}</button>
    </form>}
  </div>;
}

export default function RegulationModal() {
  const { regulations, openId, closeModal, assessmentByRegulationId, canAssessCompliance } = useRegulationModal();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const regulation = openId != null ? regulations.find((r) => r.id === openId) : undefined;

  useEffect(() => {
    if (!regulation) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [regulation, closeModal]);

  if (!regulation) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-summary">
        <button ref={closeBtnRef} className="close-btn" onClick={closeModal}>
          ✕ Close
        </button>
        <div className="modal-title" id="modal-title">
          {regulation.title}
        </div>
        <div className="modal-meta">
          {regulation.regulator} · {regulation.type} · Published {formatDate(regulation.date)} · Deadline: {regulation.deadline === "Implemented" || regulation.deadline === "Immediate" ? regulation.deadline : formatDate(regulation.deadline)}
        </div>
        {regulation.sourceUrl && (
          <div className="modal-meta">
            Source: <a href={regulation.sourceUrl} target="_blank" rel="noreferrer">View the original {regulation.regulator} publication</a>
            {regulation.retrievedAt && ` · Retrieved ${formatDateTime(regulation.retrievedAt)}`}
          </div>
        )}
        <div className="modal-section">
          <div className="modal-section-title">AI Summary</div>
          <div className="modal-body" id="modal-summary">{regulation.summary}</div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">What this means for your business</div>
          <div className="modal-body">{regulation.impact}</div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Areas Affected</div>
          <div>
            {regulation.tags.map((t) => (
              <span className="impact-tag" key={t}>
                ◆ {t}
              </span>
            ))}
          </div>
        </div>
        <ComplianceAssessmentPanel key={regulation.id} regulationId={regulation.id} assessment={assessmentByRegulationId[regulation.id]} canAssess={canAssessCompliance && regulation.id > 0} />
      </div>
    </div>
  );
}
