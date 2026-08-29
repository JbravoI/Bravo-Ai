import JuriGrid from "@/components/JuriGrid";
import PrefsIndustryFocus from "@/components/PrefsIndustryFocus";
import { getJurisdictions } from "@/lib/data";

export default async function PrefsPage() {
  const jurisdictions = await getJurisdictions();

  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Alert Preferences &amp; Jurisdictions
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div className="modal-section-title">Jurisdictions</div>
          <JuriGrid jurisdictions={jurisdictions} />
        </div>
        <div>
          <div className="modal-section-title">Alert Thresholds</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label className="pref-check">
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} /> High priority alerts
              via email
            </label>
            <label className="pref-check">
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} /> Medium priority on
              dashboard
            </label>
            <label className="pref-check">
              <input type="checkbox" style={{ accentColor: "var(--accent)" }} /> Low priority weekly digest
            </label>
            <label className="pref-check">
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} /> Mobile push
              notifications
            </label>
          </div>
        </div>
        <div>
          <div className="modal-section-title">Industry Focus</div>
          <PrefsIndustryFocus />
        </div>
      </div>
    </div>
  );
}
