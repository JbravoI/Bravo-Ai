import { NextResponse } from "next/server";

// Simulated — Phase 5 replaces this with a real ingestion run against FCA/PRA/HMT/EU
// sources, writing to `regulations`/`regulation_versions` and appending to the audit
// log. See STRATEGY.md. This stub exists so the API contract is settled ahead of that.
export async function POST() {
  return NextResponse.json({
    ok: true,
    simulated: true,
    scannedAt: new Date().toISOString(),
    newRecords: 0,
    message: "Simulated scan — no regulator sources were actually queried. See STRATEGY.md Phase 5.",
  });
}
