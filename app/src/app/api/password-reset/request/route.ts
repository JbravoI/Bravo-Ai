import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  await requestPasswordReset(email);
  // Do not reveal whether this email is registered.
  return NextResponse.json({ ok: true, message: "If an account exists for that email, an administrator will verify the request and provide a reset link." });
}
