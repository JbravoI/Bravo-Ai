"use client";

import type { Regulation } from "@/lib/types";
import { useRegulationModal } from "@/context/RegulationModalContext";

const ICON_CLASS: Record<Regulation["source"], string> = {
  fca: "icon-fca",
  pra: "icon-pra",
  hmt: "icon-hmt",
  eu: "icon-eu",
};
const ICON_EMOJI: Record<Regulation["source"], string> = {
  fca: "⚖",
  pra: "🏛",
  hmt: "🏦",
  eu: "🌍",
};
const PRIORITY_BADGE: Record<Regulation["priority"], [string, string]> = {
  high: ["badge-high", "HIGH"],
  medium: ["badge-medium", "MEDIUM"],
  low: ["badge-low", "LOW"],
};
const STATUS_BADGE: Record<Regulation["status"], [string, string] | null> = {
  new: ["badge-new", "NEW"],
  pending: ["badge-pending", "PENDING"],
  implemented: ["badge-impl", "IMPLEMENTED"],
};

export default function AlertCard({ regulation }: { regulation: Regulation }) {
  const { openModal } = useRegulationModal();
  const [priorityClass, priorityLabel] = PRIORITY_BADGE[regulation.priority];
  const statusBadge = STATUS_BADGE[regulation.status];

  return (
    <button
      type="button"
      className={`alert-card ${regulation.priority}`}
      onClick={() => openModal(regulation.id)}
    >
      <div className={`alert-icon ${ICON_CLASS[regulation.source]}`}>{ICON_EMOJI[regulation.source]}</div>
      <div className="alert-body">
        <div className="alert-title">{regulation.title}</div>
        <div className="alert-meta">
          <span>{regulation.regulator}</span>
          <span>{regulation.type}</span>
          <span>Due: {regulation.deadline}</span>
        </div>
        <div className="alert-summary">{regulation.summary}</div>
      </div>
      <div className="alert-right">
        <span className={`badge ${priorityClass}`}>{priorityLabel}</span>
        {statusBadge && <span className={`badge ${statusBadge[0]}`}>{statusBadge[1]}</span>}
        <span className="alert-time">{regulation.date}</span>
      </div>
    </button>
  );
}
