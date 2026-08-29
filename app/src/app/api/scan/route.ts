import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLatestScanRun } from "@/lib/data";
import { runFcaIngestion } from "@/lib/ingest/fca";
import { runAdditionalSourceIngestion } from "@/lib/ingest/sources";
import { getDb } from "@/lib/mongodb";

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
    const runs = [];
    const errors: string[] = [];
    for (const [name, run] of [["FCA", runFcaIngestion], ["PRA", () => runAdditionalSourceIngestion("pra")], ["HM Treasury", () => runAdditionalSourceIngestion("hmt")], ["ESMA", () => runAdditionalSourceIngestion("eu")]] as const) {
      try {
        runs.push(await run());
      } catch (sourceError) {
        const message = sourceError instanceof Error ? sourceError.message : "A regulatory source scan failed.";
        errors.push(`${name}: ${message}`);
        await getDb().then((db) => db.collection("audit_log").insertOne({ ts: new Date().toISOString(), label: `${name} scan failed`, detail: message })).catch(() => undefined);
      }
    }
    if (!runs.length) throw new Error(errors.join(" ") || "All regulatory source scans failed.");
    return NextResponse.json({ ok: errors.length === 0, runs, errors, completedAt: runs.at(-1)?.completedAt, newRecords: runs.reduce((total, run) => total + run.newRecords, 0), changedRecords: runs.reduce((total, run) => total + run.changedRecords, 0) });
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
