import type { AuditEntry } from "@/lib/types";

export default function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="table-wrap" style={{ padding: "14px 18px" }}>
      {entries.map((entry, i) => (
        <div className="audit-line" key={i}>
          <span className="audit-ts">{entry.ts}</span>
          <span className="audit-dot" />
          <span className="audit-text">
            <strong>{entry.label}</strong> – {entry.detail}
          </span>
        </div>
      ))}
    </div>
  );
}
