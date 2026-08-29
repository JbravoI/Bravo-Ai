import { NextResponse } from "next/server";
import { IMPACT } from "@/lib/data";

// Backed by in-memory seed data until Phase 2's Postgres store lands. See STRATEGY.md.
export async function GET() {
  return NextResponse.json(IMPACT);
}
