# Epic 04: Secure AI Q&A

**Status:** `Completed`
**Maps To:** `../../STRATEGY.md` Phase 4
**Target Surface(s):** `app/src/app/api/query/route.ts`, Gemini API

---

## Overview

Make the AI Q&A panel actually work, without ever putting a provider API key in the browser.

---

## Delivered

- Gemini 3.6 Flash is called only from `app/src/app/api/query/route.ts`, using the server-only `GEMINI_API_KEY` environment variable. Gemini 2.5 Flash was unavailable to this new API user.
- The endpoint requires an Auth.js session, accepts only `{ question }`, bounds question length, and never accepts a client-supplied system prompt.
- It supplies the fixed Bravo Ai instruction plus the current tracked-regulation context to Gemini, returns the established `{ answer }` contract, and logs completed exchanges to MongoDB `qa_log`.
- A process-local eight-request-per-minute guard protects the Gemini free tier; requests have a 20-second timeout and one retry for transient provider failures.
- `QAPanel.tsx` already uses the final request/response contract and renders failures safely as text.

## Remaining Follow-up

- Structured citations in the response and a distributed rate limiter remain future hardening work.
- Gemini search grounding is deliberately not enabled; it cannot replace Phase 5's source-ingestion pipeline.

## Acceptance Criteria

- [x] A real question submitted through the Q&A panel gets a provider-generated, regulation-grounded answer when `GEMINI_API_KEY` is configured.
- [x] No AI provider API key appears in any browser-visible network request.
- [x] Every completed exchange is logged.
