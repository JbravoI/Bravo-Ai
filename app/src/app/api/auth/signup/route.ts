import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const user = await createUser(email, password);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Signup failed." }, { status: 400 });
  }
}
