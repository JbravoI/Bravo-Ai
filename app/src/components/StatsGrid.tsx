"use client";

import { useRegulationModal } from "@/context/RegulationModalContext";

export default function StatsGrid() {
  const { regulations } = useRegulationModal();
  const highPriority = regulations.filter((regulation) => regulation.priority === "high").length;
  const pending = regulations.filter((regulation) => regulation.status !== "implemented").length;
  const score = regulations.length ? Math.round(regulations.reduce((total, regulation) => total + regulation.readiness, 0) / regulations.length) : 0;
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Regulations Tracked</div>
        <div className="stat-value">{regulations.length}</div>
        <div className="stat-delta">Live database total</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">High Priority</div>
        <div className="stat-value" style={{ color: "var(--danger)" }}>
          {highPriority}
        </div>
        <div className="stat-delta warn">Requires attention</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Review</div>
        <div className="stat-value" style={{ color: "var(--warn)" }}>
          {pending}
        </div>
        <div className="stat-delta">Not implemented</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Compliance Score</div>
        <div className="stat-value" style={{ color: "var(--success)" }}>
          {score}%
        </div>
        <div className="stat-delta">Average readiness</div>
      </div>
    </div>
  );
}
