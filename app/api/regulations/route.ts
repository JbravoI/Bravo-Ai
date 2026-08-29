import { NextResponse } from "next/server";
import { REGULATIONS } from "@/lib/data";
import type { Source } from "@/lib/types";

const VALID_SOURCES: Source[] = ["fca", "pra", "hmt", "eu"];

// Backed by in-memory seed data until Phase 2's Postgres store lands. See STRATEGY.md.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");

  if (source && !VALID_SOURCES.includes(source as Source)) {
    return NextResponse.json(
      { error: `Invalid source "${source}". Expected one of: ${VALID_SOURCES.join(", ")}.` },
      { status: 400 },
    );
  }

  const list = source ? REGULATIONS.filter((r) => r.source === source) : REGULATIONS;
  return NextResponse.json(list);
}
