import AuditLog from "@/components/AuditLog";
import { getAuditEntries } from "@/lib/data";

export default async function AuditPage() {
  const entries = await getAuditEntries();

  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Audit Trail &amp; Activity Log
      </div>
      <AuditLog entries={entries} />
    </div>
  );
}
