import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserPreferences, saveUserPreferences } from "@/lib/preferences";
import { clearDeselectedOptionalNigeriaRegulations, normalizeOptionalNigeriaRegulatorCodes, runOptionalNigeriaRegulatorIngestion } from "@/lib/optional-nigeria-regulators";

export const maxDuration = 60;

// Requires a signed-in session — unlike the read-only data routes, preferences
// are inherently per-user. See docs/architecture/02-api-and-client-integration.md.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prefs = await getUserPreferences(session.user.id);
  return NextResponse.json(prefs ?? {});
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { activeJurisdictionCodes, activeIndustryFocus, optionalNigeriaRegulatorCodes } = body;
  if (Array.isArray(activeJurisdictionCodes) && (activeJurisdictionCodes.length !== 1 || !activeJurisdictionCodes.every((code) => typeof code === "string"))) {
    return NextResponse.json({ error: "Select exactly one jurisdiction." }, { status: 400 });
  }
  if (Array.isArray(activeIndustryFocus) && !activeIndustryFocus.every((industry) => typeof industry === "string")) {
    return NextResponse.json({ error: "Industry focus must be a list of labels." }, { status: 400 });
  }
  if (optionalNigeriaRegulatorCodes !== undefined && (!Array.isArray(optionalNigeriaRegulatorCodes) || !optionalNigeriaRegulatorCodes.every((code) => typeof code === "string"))) {
    return NextResponse.json({ error: "Optional Nigeria regulators must be a list of codes." }, { status: 400 });
  }
  const optionalCodes = normalizeOptionalNigeriaRegulatorCodes(optionalNigeriaRegulatorCodes);
  if (Array.isArray(optionalNigeriaRegulatorCodes) && optionalCodes.length !== new Set(optionalNigeriaRegulatorCodes).size) {
    return NextResponse.json({ error: "One or more optional Nigeria regulator codes are invalid." }, { status: 400 });
  }
  const previous = await getUserPreferences(session.user.id);
  const previousCodes = normalizeOptionalNigeriaRegulatorCodes(previous?.optionalNigeriaRegulatorCodes);
  const selectedNigeria = (Array.isArray(activeJurisdictionCodes) ? activeJurisdictionCodes[0] : previous?.activeJurisdictionCodes?.[0]) === "NG";
  const newlySelected = selectedNigeria ? optionalCodes.filter((code) => !previousCodes.includes(code)) : [];
  await saveUserPreferences(session.user.id, session.user.email, {
    ...(Array.isArray(activeJurisdictionCodes) ? { activeJurisdictionCodes } : {}),
    ...(Array.isArray(activeIndustryFocus) ? { activeIndustryFocus } : {}),
    ...(Array.isArray(optionalNigeriaRegulatorCodes) ? { optionalNigeriaRegulatorCodes: optionalCodes } : {}),
  });
  if (Array.isArray(optionalNigeriaRegulatorCodes)) await clearDeselectedOptionalNigeriaRegulations(session.user.id, selectedNigeria ? optionalCodes : []);
  const scan = newlySelected.length ? await runOptionalNigeriaRegulatorIngestion(session.user.id, newlySelected) : undefined;
  return NextResponse.json({ ok: true, optionalScan: scan });
}
