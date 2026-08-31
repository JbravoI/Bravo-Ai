import { NextResponse } from "next/server";
import { consumePasswordReset } from "@/lib/password-reset";
import { hashPassword } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!token) return NextResponse.json({ error: "Password reset token is missing." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  try {
    await consumePasswordReset(token, await hashPassword(password));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not reset password." }, { status: 400 });
  }
}
