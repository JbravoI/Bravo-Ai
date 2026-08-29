# ADR 0002: Gemini 3.6 Flash As AI Provider, Called Server-Side Only

## Status

Supersedes the earlier Anthropic provider choice. Server-side-only calling remains a hard rule.

## Context

The prototype's Q&A panel called a fictional domain (`api.regwatch.ai`, later renamed `api.bravoai.app`) directly from browser JavaScript, with a placeholder API key (`YOUR-API-KEY-HERE`) in the `Authorization` header. Any browser-held provider key is extractable and cannot be accepted for a compliance product.

Two separate concerns were at stake: which provider to use, and whether it's ever acceptable to call that provider directly from the browser. The second question has one answer regardless of provider: no. Any API key shipped to a browser can be extracted and misused by anyone who opens dev tools.

## Decision

Use Gemini 3.6 Flash as the AI provider. Gemini 2.5 Flash returns a provider-declared unavailable-to-new-users response for this API key; Gemini 3.6 Flash is the provider-recommended, verified successor. All calls happen inside `app/src/app/api/query/route.ts` (a Next.js Route Handler, server-side only) — never from client-side code. The API key lives only in the server-only `GEMINI_API_KEY` environment variable. The implementation uses Gemini's HTTPS GenerateContent endpoint directly, keeping the dependency surface small.

Gemini search grounding is not enabled. It may be evaluated later as a clearly labelled supplement for recent regulatory items, but it cannot replace the structured, versioned, citable database that Phase 5 builds. Dashboard, compliance and audit data must come from that database.

## Consequences

- `/api/query` now implements the `{ question }` → `{ answer }` contract and returns `501` only when `GEMINI_API_KEY` is unavailable.
- It requires Auth.js authentication, validates question length, limits each process to eight requests per minute, retries one transient failure, and applies a 20-second provider timeout.
- Every completed exchange is logged in `qa_log` for cost/abuse monitoring and compliance traceability.
- If search grounding is enabled later, its use must be visually distinguished from answers grounded in the firm's tracked regulation set.
