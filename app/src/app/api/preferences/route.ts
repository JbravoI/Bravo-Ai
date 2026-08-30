import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserPreferences, saveUserPreferences } from "@/lib/preferences";

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
  const { activeJurisdictionCodes, activeIndustryFocus } = body;
  if (Array.isArray(activeJurisdictionCodes) && (activeJurisdictionCodes.length !== 1 || !activeJurisdictionCodes.every((code) => typeof code === "string"))) {
    return NextResponse.json({ error: "Select exactly one jurisdiction." }, { status: 400 });
  }
  if (Array.isArray(activeIndustryFocus) && !activeIndustryFocus.every((industry) => typeof industry === "string")) {
    return NextResponse.json({ error: "Industry focus must be a list of labels." }, { status: 400 });
  }
  await saveUserPreferences(session.user.id, session.user.email, {
    ...(Array.isArray(activeJurisdictionCodes) ? { activeJurisdictionCodes } : {}),
    ...(Array.isArray(activeIndustryFocus) ? { activeIndustryFocus } : {}),
  });
  return NextResponse.json({ ok: true });
}
