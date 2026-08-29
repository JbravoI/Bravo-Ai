import JuriGrid from "@/components/JuriGrid";
import PrefsIndustryFocus from "@/components/PrefsIndustryFocus";
import { getJurisdictions } from "@/lib/data";
import { getUserPreferences } from "@/lib/preferences";
import { auth } from "@/auth";

const DEFAULT_INDUSTRY_FOCUS = ["Banking", "Investment"];

export default async function PrefsPage() {
  const session = await auth();
  const [jurisdictions, savedPrefs] = await Promise.all([
    getJurisdictions(),
    session?.user?.id ? getUserPreferences(session.user.id) : Promise.resolve(null),
  ]);

  const initialJurisdictionCodes =
    savedPrefs?.activeJurisdictionCodes ?? jurisdictions.filter((j) => j.active).map((j) => j.code);
  const initialIndustryFocus = savedPrefs?.activeIndustryFocus ?? DEFAULT_INDUSTRY_FOCUS;

  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Alert Preferences &amp; Jurisdictions
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div className="modal-section-title">Jurisdictions</div>
          <JuriGrid jurisdictions={jurisdictions} initialActiveCodes={initialJurisdictionCodes} />
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
          <PrefsIndustryFocus initialActive={initialIndustryFocus} />
        </div>
      </div>
    </div>
  );
}
