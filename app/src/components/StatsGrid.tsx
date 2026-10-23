"use client";

import { useRegulationModal } from "@/context/RegulationModalContext";

export default function StatsGrid() {
  const { regulations, assessmentByRegulationId } = useRegulationModal();
  const highPriority = regulations.filter((regulation) => regulation.priority === "high").length;
  const pending = regulations.filter((regulation) => regulation.status !== "implemented").length;
  const assessments = regulations.map((regulation) => assessmentByRegulationId[regulation.id]).filter((assessment): assessment is NonNullable<typeof assessment> => Boolean(assessment));
  const score = assessments.length ? Math.round(assessments.reduce((total, assessment) => total + assessment.readiness, 0) / assessments.length) : null;
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
          {score === null ? "—" : `${score}%`}
        </div>
        <div className="stat-delta">{assessments.length} of {regulations.length} assessed</div>
      </div>
    </div>
  );
}
