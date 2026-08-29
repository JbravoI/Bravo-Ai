import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { getRegulations } from "@/lib/data";
import { getDb } from "@/lib/mongodb";

// Allow up to 60s on Vercel for a synchronous Q&A response (default is 10s on
// Hobby) — Claude Opus 5 runs adaptive thinking by default, which can take
// longer than a typical chat reply.
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are the Bravo Ai regulatory assistant, an expert UK financial regulatory assistant specialising in FCA, PRA, HM Treasury, and EU financial regulations. You help compliance teams, legal professionals, and executives understand regulatory changes.

When answering:
- Be concise and practical.
- Cite the specific regulation or policy reference where possible.
- Flag deadlines and urgency.
- Explain what it means for financial firms in plain English.
- Ground your answer in the tracked regulations listed below where relevant. If a question falls outside what's listed, say so rather than inventing details.

Keep answers under 200 words unless detail is essential.`;

// Requires a session — unlike the read-only data routes (a deliberate Epic 02
// design choice, see docs/architecture/02-api-and-client-integration.md),
// this endpoint costs real money per call and must not be callable
// anonymously. See docs/decisions/0002-anthropic-server-side-ai.md.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: 'Request body must include a non-empty "question" string.' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI Q&A is not configured on this deployment (ANTHROPIC_API_KEY missing)." }, { status: 501 });
  }

  const regulations = await getRegulations();
  const context = regulations
    .map((r) => `- [${r.regulator}] ${r.title} (published ${r.date}, deadline ${r.deadline}): ${r.summary}`)
    .join("\n");

  const client = new Anthropic();
  let answer: string;
  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\nTracked regulations:\n${context}`,
      messages: [{ role: "user", content: question }],
    });
    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    answer = textBlock?.text ?? "";
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "AI provider authentication failed — check ANTHROPIC_API_KEY." }, { status: 502 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "AI provider is rate-limited — try again shortly." }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `AI provider error: ${err.message}` }, { status: 502 });
    }
    throw err;
  }

  // Compliance audit traceability for AI usage, per Epic 04's requirements —
  // separate from audit_log, which tracks user-facing actions.
  const db = await getDb();
  await db.collection("qa_log").insertOne({
    userId: session.user.id,
    userEmail: session.user.email,
    question,
    answer,
    ts: new Date().toISOString(),
  });

  return NextResponse.json({ answer });
}
