import ImpactTable from "@/components/ImpactTable";
import { getJurisdictions, getRegulationsForUserJurisdiction } from "@/lib/data";
import type { ImpactLevel, ImpactRow } from "@/lib/types";
import { auth } from "@/auth";
import { getUserPreferences } from "@/lib/preferences";
import { selectedJurisdictionCode } from "@/lib/jurisdictions";

function level(regulation: { priority: string; tags: string[] }, area: string): ImpactLevel {
  if (!regulation.tags.some((tag) => tag.toLowerCase() === area.toLowerCase())) return "None";
  return regulation.priority === "high" ? "High" : regulation.priority === "medium" ? "Medium" : "Low";
}

export default async function ImpactPage() {
  const session = await auth();
  const [jurisdictions, preferences] = await Promise.all([
    getJurisdictions(),
    session?.user?.id ? getUserPreferences(session.user.id) : Promise.resolve(null),
  ]);
  const jurisdictionCode = selectedJurisdictionCode(preferences?.activeJurisdictionCodes, jurisdictions.map((jurisdiction) => jurisdiction.code));
  const regulations = session?.user?.id
    ? await getRegulationsForUserJurisdiction(session.user.id, jurisdictionCode, preferences?.optionalNigeriaRegulatorCodes)
    : [];
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
