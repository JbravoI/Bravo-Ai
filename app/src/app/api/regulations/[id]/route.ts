import { NextRequest, NextResponse } from "next/server";
import { getRegulationById } from "@/lib/data";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/regulations/[id]">) {
  const { id } = await ctx.params;
  const regulationId = Number(id);

  if (!Number.isInteger(regulationId)) {
    return NextResponse.json({ error: `Invalid regulation id "${id}".` }, { status: 400 });
  }

  const regulation = await getRegulationById(regulationId);
  if (!regulation) {
    return NextResponse.json({ error: `Regulation ${regulationId} not found.` }, { status: 404 });
  }

  return NextResponse.json(regulation);
}
