import PreferencesForm from "@/components/PreferencesForm";
import { getJurisdictions } from "@/lib/data";
import { getUserPreferences } from "@/lib/preferences";
import { auth } from "@/auth";
import { normalizeOptionalNigeriaRegulatorCodes } from "@/lib/optional-nigeria-regulators";

const DEFAULT_INDUSTRY_FOCUS = ["Banking", "Investment"];

export default async function PrefsPage() {
  const session = await auth();
  const [jurisdictions, savedPrefs] = await Promise.all([
    getJurisdictions(),
    session?.user?.id ? getUserPreferences(session.user.id) : Promise.resolve(null),
  ]);

  const initialJurisdictionCode =
    savedPrefs?.activeJurisdictionCodes?.find((code) => jurisdictions.some((jurisdiction) => jurisdiction.code === code)) ??
    jurisdictions.find((jurisdiction) => jurisdiction.active)?.code ?? jurisdictions[0]?.code ?? "";
  const initialIndustryFocus = savedPrefs?.activeIndustryFocus ?? DEFAULT_INDUSTRY_FOCUS;

  return (
    <div className="page">
      <div className="section-title" style={{ marginBottom: 12 }}>
        Alert Preferences &amp; Jurisdictions
      </div>
      <PreferencesForm jurisdictions={jurisdictions} initialJurisdictionCode={initialJurisdictionCode} initialIndustryFocus={initialIndustryFocus} initialOptionalNigeriaRegulatorCodes={normalizeOptionalNigeriaRegulatorCodes(savedPrefs?.optionalNigeriaRegulatorCodes)} />
    </div>
  );
}
