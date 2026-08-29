import { NextResponse } from "next/server";

// Not yet implemented — Phase 4 wires this to the Anthropic API server-side
// (key held in an env var, never sent to the browser). See STRATEGY.md.
// Returning 501 rather than a canned/fake answer, so nothing here pretends
// to be a working AI integration before it is one.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.question !== "string" || !body.question.trim()) {
    return NextResponse.json({ error: "Request body must include a non-empty \"question\" string." }, { status: 400 });
  }

  return NextResponse.json(
    { error: "AI Q&A is not yet wired up. See STRATEGY.md Phase 4." },
    { status: 501 },
  );
}
