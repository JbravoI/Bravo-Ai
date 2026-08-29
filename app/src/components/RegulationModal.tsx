"use client";

import { useEffect, useRef } from "react";
import { useRegulationModal } from "@/context/RegulationModalContext";
import { formatDate, formatDateTime } from "@/lib/dates";

export default function RegulationModal() {
  const { regulations, openId, closeModal } = useRegulationModal();
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
      </div>
    </div>
  );
}
