import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { issuePasswordResetLink } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const requestId = typeof body?.requestId === "string" ? body.requestId : "";
  try {
    return NextResponse.json(await issuePasswordResetLink(requestId, admin.email, new URL(request.url).origin));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not issue reset link." }, { status: 400 });
  }
}
