import ComplianceTable from "@/components/ComplianceTable";

export default function CompliancePage() {
  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Compliance Readiness Dashboard
      </div>
      <ComplianceTable />
    </div>
  );
}
