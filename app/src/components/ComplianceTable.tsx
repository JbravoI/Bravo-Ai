"use client";

import type { Regulation } from "@/lib/types";
import { useRegulationModal } from "@/context/RegulationModalContext";
import { formatDate } from "@/lib/dates";

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

export default function ComplianceTable() {
  const { regulations, openModal } = useRegulationModal();

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Regulation</th>
            <th>Regulator</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Readiness</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {regulations.map((r) => {
            const progressClass = r.readiness >= 70 ? "pf-green" : r.readiness >= 40 ? "pf-warn" : "pf-danger";
            const [priorityClass, priorityLabel] = PRIORITY_BADGE[r.priority];
            const statusBadge = STATUS_BADGE[r.status];
            return (
              <tr
                key={r.id}
                onClick={() => openModal(r.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(r.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${r.title}`}
                style={{ cursor: "pointer" }}
              >
                <td style={{ color: "var(--text)", fontWeight: 500, maxWidth: 240, fontSize: 11 }}>{r.title}</td>
                <td>
                  <span className="pill">{r.regulator}</span>
                </td>
                <td>{statusBadge && <span className={`badge ${statusBadge[0]}`}>{statusBadge[1]}</span>}</td>
                <td style={{ fontFamily: "var(--fm)", fontSize: 10 }}>{r.deadline === "Implemented" || r.deadline === "Immediate" ? r.deadline : formatDate(r.deadline)}</td>
                <td style={{ minWidth: 120 }}>
                  <div className="progress-wrap">
                    <div className="progress-bar">
                      <div className={`progress-fill ${progressClass}`} style={{ width: `${r.readiness}%` }} />
                    </div>
                    <span className="progress-pct">{r.readiness}%</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${priorityClass}`}>{priorityLabel}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
