import AuditLog from "@/components/AuditLog";

export default function AuditPage() {
  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Audit Trail &amp; Activity Log
      </div>
      <AuditLog />
    </div>
  );
}
