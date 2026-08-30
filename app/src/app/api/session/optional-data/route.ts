import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearOptionalNigeriaRegulations } from "@/lib/optional-nigeria-regulators";

// The selected bodies remain in preferences, but their fetched records are
// session-scoped and are removed before either explicit or idle sign-out.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await clearOptionalNigeriaRegulations(session.user.id);
  return NextResponse.json({ ok: true, deleted });
}
