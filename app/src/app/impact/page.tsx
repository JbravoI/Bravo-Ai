import ImpactTable from "@/components/ImpactTable";
import { getRegulations } from "@/lib/data";
import type { ImpactLevel, ImpactRow } from "@/lib/types";

function level(regulation: { priority: string; tags: string[] }, area: string): ImpactLevel {
  if (!regulation.tags.some((tag) => tag.toLowerCase() === area.toLowerCase())) return "None";
  return regulation.priority === "high" ? "High" : regulation.priority === "medium" ? "Medium" : "Low";
}

export default async function ImpactPage() {
  const regulations = await getRegulations();
  const rows: ImpactRow[] = regulations.map((regulation) => ({
    reg: regulation.title,
    banking: level(regulation, "Banking"),
    invest: level(regulation, "Investment"),
    insure: level(regulation, "Insurance"),
    comp: level(regulation, "Compliance"),
    ops: level(regulation, "Operations"),
  }));

  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Regulatory Impact by Business Area
      </div>
      <ImpactTable rows={rows} />
    </div>
  );
}
