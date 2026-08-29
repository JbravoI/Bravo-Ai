# ADR 0002: Anthropic As AI Provider, Called Server-Side Only

## Status

Accepted for the provider choice. Server-side-only calling is a hard rule, not open for reconsideration without a new ADR.

## Context

The prototype's Q&A panel called a fictional domain (`api.regwatch.ai`, later renamed `api.bravoai.app`) directly from browser JavaScript, with a placeholder API key (`YOUR-API-KEY-HERE`) in the `Authorization` header. The request/response shape it used — a `system` field, `messages: [{ role, content }]`, `max_tokens`, and parsing `content[].type === 'text'` — already matches Anthropic's Messages API format, which made Anthropic the path of least friction rather than a cold choice.

Two separate concerns were at stake: which provider to use, and whether it's ever acceptable to call that provider directly from the browser. The second question has one answer regardless of provider: no. Any API key shipped to a browser can be extracted and misused by anyone who opens dev tools.

## Decision

Use Anthropic (Claude) as the AI provider. All calls happen inside `app/src/app/api/query/route.ts` (a Next.js Route Handler, server-side only) — never from client-side code. The API key lives in a server-only environment variable.

Anthropic's web search tool (server-side, enabled per API account) is a candidate supplement for the Q&A panel — letting it answer about very recent regulatory items the ingestion pipeline (Phase 5) hasn't caught yet — but it is not a replacement for the structured, versioned, citable database Phase 5 builds. Structured dashboard/compliance/audit data must come from the database, not from ad hoc search results.

## Consequences

- `/api/query` is currently a stub returning `501` (see `../architecture/02-api-and-client-integration.md`) rather than a fake canned answer, specifically so nothing claims to be a working AI integration before it is one.
- `app/src/components/QAPanel.tsx`'s current placeholder `fetch` call and body shape (`{ question }` → `{ answer }`) will need to be reconciled with the real `/api/query` contract once Phase 4 lands — tracked in `../../implementation/epic-04-secure-ai-qa/index.md`.
- Every real Q&A exchange must be logged (`qa_log` in `../architecture/03-data-model.md`) once implemented, both for cost/abuse monitoring and as part of the product's compliance audit trail.
- If web search is enabled later, its use should be visually distinguished in the UI from answers grounded in the firm's own tracked regulation set, so a compliance officer can tell the difference.
