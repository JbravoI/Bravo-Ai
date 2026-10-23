import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createComplianceAssessment, getLatestComplianceAssessments, validateComplianceAssessment } from "@/lib/compliance-assessments";
import { getJurisdictions, getRegulationsForUserJurisdiction } from "@/lib/data";
import { getUserPreferences } from "@/lib/preferences";
import { selectedJurisdictionCode } from "@/lib/jurisdictions";
import { getUserById } from "@/lib/users";

async function currentScope(userId: string) {
  const [preferences, jurisdictions] = await Promise.all([getUserPreferences(userId), getJurisdictions()]);
  const jurisdictionCode = selectedJurisdictionCode(preferences?.activeJurisdictionCodes, jurisdictions.map((jurisdiction) => jurisdiction.code));
  const regulations = jurisdictionCode
    ? await getRegulationsForUserJurisdiction(userId, jurisdictionCode, preferences?.optionalNigeriaRegulatorCodes)
    : [];
  return regulations;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const regulations = await currentScope(session.user.id);
  return NextResponse.json({ assessments: await getLatestComplianceAssessments(regulations.map((regulation) => regulation.id).filter((id) => id > 0)) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserById(session.user.id);
  if (!user || user.role === "viewer") return NextResponse.json({ error: "Analyst or administrator access is required." }, { status: 403 });
  try {
    const input = validateComplianceAssessment(await request.json().catch(() => null));
    const regulations = await currentScope(user.id);
    if (!regulations.some((regulation) => regulation.id === input.regulationId)) {
      return NextResponse.json({ error: "Regulation not found in your selected jurisdiction." }, { status: 404 });
    }
    return NextResponse.json({ assessment: await createComplianceAssessment(input, { id: user.id, email: user.email }) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not record assessment." }, { status: 400 });
  }
}
