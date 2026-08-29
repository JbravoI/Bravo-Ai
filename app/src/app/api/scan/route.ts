import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLatestScanRun } from "@/lib/data";
import { runFcaIngestion } from "@/lib/ingest/fca";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isAuthorizedCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function canRunScan(request: Request) {
  if (isAuthorizedCron(request)) return true;
  const session = await auth();
  return Boolean(session?.user?.id);
}

async function runScan(request: Request) {
  if (!(await canRunScan(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const run = await runFcaIngestion();
    return NextResponse.json({ ok: true, ...run });
  } catch (error) {
    const message = error instanceof Error ? error.message : "FCA ingestion failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  if (isAuthorizedCron(request)) return runScan(request);

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ lastRun: await getLatestScanRun() });
}

export async function POST(request: Request) {
  return runScan(request);
}
