import ImpactTable from "@/components/ImpactTable";

export default function ImpactPage() {
  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Regulatory Impact by Business Area
      </div>
      <ImpactTable />
    </div>
  );
}
