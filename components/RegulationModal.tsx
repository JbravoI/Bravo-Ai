"use client";

import { useEffect, useRef } from "react";
import { getRegulation } from "@/lib/data";
import { useRegulationModal } from "@/context/RegulationModalContext";

export default function RegulationModal() {
  const { openId, closeModal } = useRegulationModal();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const regulation = openId != null ? getRegulation(openId) : undefined;

  useEffect(() => {
    if (!regulation) return;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [regulation, closeModal]);

  if (!regulation) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button ref={closeBtnRef} className="close-btn" onClick={closeModal}>
          ✕ Close
        </button>
        <div className="modal-title" id="modal-title">
          {regulation.title}
        </div>
        <div className="modal-meta">
          {regulation.regulator} · {regulation.type} · Published {regulation.date} · Deadline: {regulation.deadline}
        </div>
        <div className="modal-section">
          <div className="modal-section-title">AI Summary</div>
          <div className="modal-body">{regulation.summary}</div>
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
