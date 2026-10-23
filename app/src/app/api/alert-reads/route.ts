import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getJurisdictions, getRegulationForUser, getRegulationsForUserJurisdiction } from "@/lib/data";
import { getDb } from "@/lib/mongodb";
import { getUserPreferences } from "@/lib/preferences";
import { selectedJurisdictionCode } from "@/lib/jurisdictions";

async function getUserId() {
  const session = await auth();
  return session?.user?.id;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const reads = await db.collection<{ regulationId: number }>("alert_reads")
    .find({ userId }, { projection: { _id: 0, regulationId: 1 } })
    .toArray();
  return NextResponse.json({ regulationIds: reads.map((read) => read.regulationId) });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (body?.action === "mark-all") {
    const [preferences, jurisdictions] = await Promise.all([getUserPreferences(userId), getJurisdictions()]);
    const jurisdictionCode = selectedJurisdictionCode(preferences?.activeJurisdictionCodes, jurisdictions.map((jurisdiction) => jurisdiction.code));
    if (!jurisdictionCode) return NextResponse.json({ regulationIds: [], newlyRead: 0 });

    const regulations = await getRegulationsForUserJurisdiction(userId, jurisdictionCode, preferences?.optionalNigeriaRegulatorCodes);
    const regulationIds = regulations.map((regulation) => regulation.id);
    const db = await getDb();
    const existing = await db.collection<{ regulationId: number }>("alert_reads")
      .find({ userId, regulationId: { $in: regulationIds } }, { projection: { _id: 0, regulationId: 1 } })
      .toArray();
    const existingIds = new Set(existing.map((read) => read.regulationId));
    const unreadIds = regulationIds.filter((id) => !existingIds.has(id));
    if (unreadIds.length) {
      const readAt = new Date().toISOString();
      await db.collection("alert_reads").bulkWrite(unreadIds.map((regulationId) => ({
        updateOne: {
          filter: { userId, regulationId },
          update: { $setOnInsert: { userId, regulationId, readAt } },
          upsert: true,
        },
      })));
      await db.collection("audit_log").insertOne({
        ts: readAt,
        label: "Alerts marked as viewed",
        detail: `${session.user.email ?? userId} viewed ${unreadIds.length} ${jurisdictionCode} alert${unreadIds.length === 1 ? "" : "s"} from the Alerts page.`,
      });
    }
    return NextResponse.json({ regulationIds, newlyRead: unreadIds.length });
  }

  const regulationId = body?.regulationId;
  if (!Number.isInteger(regulationId) || regulationId === 0) {
    return NextResponse.json({ error: "regulationId must be a non-zero integer." }, { status: 400 });
  }
  if (!(await getRegulationForUser(userId, regulationId))) {
    return NextResponse.json({ error: "Regulation not found." }, { status: 404 });
  }

  const db = await getDb();
  await db.collection("alert_reads").updateOne(
    { userId, regulationId },
    { $setOnInsert: { userId, regulationId, readAt: new Date().toISOString() } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
