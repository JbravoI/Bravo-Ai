import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getJurisdictions, getRegulationsForUserJurisdiction } from "@/lib/data";
import { getDb } from "@/lib/mongodb";
import { getUserPreferences } from "@/lib/preferences";
import { selectedJurisdictionCode } from "@/lib/jurisdictions";

// Allow up to 60s on Vercel for a synchronous Q&A response.
export const maxDuration = 60;

// Gemini returns a 404 for 2.5 Flash on newly provisioned API keys. Use the
// provider's currently available fast model for interactive Q&A.
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
// Free-tier responses can take around 25 seconds. Keep one bounded attempt
// rather than retrying and risking a serverless gateway timeout.
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_QUESTION_LENGTH = 4_000;
const MAX_CONTEXT_ITEMS = 60;
const MAX_CONTEXT_FIELD_LENGTH = 450;
// Gemini free-tier limits are project-wide. This process-local guard leaves
// headroom below provider quotas; a distributed limiter belongs in Epic 06
// once the app scales beyond one instance.
const REQUESTS_PER_MINUTE = 8;
let recentRequestTimes: number[] = [];

const SYSTEM_PROMPT = `You are the Bravo Ai regulatory assistant, an expert UK financial regulatory assistant specialising in FCA, PRA, HM Treasury, and EU financial regulations. You help compliance teams, legal professionals, and executives understand regulatory changes.

When answering:
- Be concise and practical.
- Cite the specific regulation or policy reference where possible.
- Flag deadlines and urgency.
- Explain what it means for financial firms in plain English.
- Ground your answer in the tracked regulations listed below where relevant. If a question falls outside what's listed, say so rather than inventing details.

Keep answers under 200 words unless detail is essential.`;

function takeRequestSlot() {
  const now = Date.now();
  recentRequestTimes = recentRequestTimes.filter((time) => now - time < 60_000);
  if (recentRequestTimes.length >= REQUESTS_PER_MINUTE) return false;
  recentRequestTimes.push(now);
  return true;
}

function contextField(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTEXT_FIELD_LENGTH);
}

async function requestGemini(contents: string, systemInstruction: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: contents }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// Requires a session: it has a finite provider quota and records an auditable
// user-specific exchange. The browser sends only the question, never a prompt
// or provider credential.
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
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.` }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI Q&A is not configured on this deployment (GEMINI_API_KEY missing)." }, { status: 501 });
  }
  if (!takeRequestSlot()) {
    return NextResponse.json(
      { error: "AI Q&A is temporarily rate-limited. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const [preferences, jurisdictions] = await Promise.all([getUserPreferences(session.user.id), getJurisdictions()]);
  const jurisdictionCode = selectedJurisdictionCode(preferences?.activeJurisdictionCodes, jurisdictions.map((jurisdiction) => jurisdiction.code));
  const regulations = jurisdictionCode
    ? await getRegulationsForUserJurisdiction(session.user.id, jurisdictionCode, preferences?.optionalNigeriaRegulatorCodes)
    : [];
  // Sending every historical record can make an otherwise simple question
  // exceed the interactive latency budget. The newest records remain enough
  // for current regulatory Q&A; users can ask about an older record by name.
  const context = regulations
    .slice(-MAX_CONTEXT_ITEMS)
    .map(
      (r) =>
        `- [${contextField(r.regulator)}] ${contextField(r.title)} ` +
        `(published ${contextField(r.date)}, deadline ${contextField(r.deadline)}): ${contextField(r.summary)}`,
    )
    .join("\n");

  let answer: string;
  try {
    const response = await requestGemini(question, `${SYSTEM_PROMPT}\n\nTracked regulations:\n${context}`);
    if (response.status === 429) {
      return NextResponse.json({ error: "Gemini is rate-limited. Please try again shortly." }, { status: 429 });
    }
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json({ error: "Gemini API authentication failed — check GEMINI_API_KEY." }, { status: 502 });
    }
    if (!response.ok) {
      return NextResponse.json({ error: "Gemini is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }
    const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
    if (!answer) {
      return NextResponse.json({ error: "Gemini did not return a usable answer. Please rephrase and try again." }, { status: 502 });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "Gemini took too long to respond. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "Gemini request failed. Please try again shortly." }, { status: 502 });
  }

  // Compliance audit traceability for AI usage, per Epic 04's requirements —
  // separate from audit_log, which tracks user-facing actions.
  const db = await getDb();
  await db.collection("qa_log").insertOne({
    userId: session.user.id,
    userEmail: session.user.email,
    provider: "gemini",
    model: GEMINI_MODEL,
    question,
    answer,
    ts: new Date().toISOString(),
  });

  return NextResponse.json({ answer });
}
