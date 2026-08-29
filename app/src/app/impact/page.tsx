import ImpactTable from "@/components/ImpactTable";
import { getImpactRows } from "@/lib/data";

export default async function ImpactPage() {
  const rows = await getImpactRows();

  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Regulatory Impact by Business Area
      </div>
      <ImpactTable rows={rows} />
    </div>
  );
}
