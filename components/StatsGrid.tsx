export default function StatsGrid() {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Regulations Tracked</div>
        <div className="stat-value">248</div>
        <div className="stat-delta up">▲ 12 this week</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">High Priority</div>
        <div className="stat-value" style={{ color: "var(--danger)" }}>
          7
        </div>
        <div className="stat-delta warn">⚠ 3 new today</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Review</div>
        <div className="stat-value" style={{ color: "var(--warn)" }}>
          23
        </div>
        <div className="stat-delta">4 near deadline</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Compliance Score</div>
        <div className="stat-value" style={{ color: "var(--success)" }}>
          84%
        </div>
        <div className="stat-delta up">▲ 3% vs last month</div>
      </div>
    </div>
  );
}
