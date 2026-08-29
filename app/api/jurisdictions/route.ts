import { NextResponse } from "next/server";
import { JURISDICTIONS } from "@/lib/data";

// Backed by in-memory seed data until Phase 3 wires this to per-user preferences. See STRATEGY.md.
export async function GET() {
  return NextResponse.json(JURISDICTIONS);
}
