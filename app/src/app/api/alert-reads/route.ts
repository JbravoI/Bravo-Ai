import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRegulationById } from "@/lib/data";
import { getDb } from "@/lib/mongodb";

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
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const regulationId = body?.regulationId;
  if (!Number.isInteger(regulationId) || regulationId < 1) {
    return NextResponse.json({ error: "regulationId must be a positive integer." }, { status: 400 });
  }
  if (!(await getRegulationById(regulationId))) {
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
