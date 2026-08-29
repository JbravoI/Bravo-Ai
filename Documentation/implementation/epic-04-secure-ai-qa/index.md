# Epic 04: Secure AI Q&A

**Status:** `Pending`
**Maps To:** `../../../STRATEGY.md` Phase 4
**Target Surface(s):** `app/api/query/route.ts`, Anthropic API

---

## Overview

Make the AI Q&A panel actually work, without ever putting a provider API key in the browser.

---

## Decided

- Provider: Anthropic. See `../../docs/decisions/0002-anthropic-server-side-ai.md` for the full reasoning — the prototype's original request shape already matches Anthropic's Messages API format, and the server-side-only rule is non-negotiable regardless of provider.
- `/api/query` currently returns `501` rather than a fake canned answer — see `../../docs/architecture/02-api-and-client-integration.md`.

## Blocked On

Epic 03 (auth) — the endpoint needs to authenticate the caller before it should be exposed for real.

## Planned Work

- Implement the real call inside `app/api/query/route.ts`, reading the API key from a server-only environment variable.
- Rate limiting, timeout/retry policy.
- Log every exchange to `qa_log` (see `../../docs/architecture/03-data-model.md`) for cost/abuse monitoring and compliance traceability.
- Reconcile `components/QAPanel.tsx`'s current placeholder request (`{ question } → { answer }`) with the real contract once defined — likely needs a citations field.
- Evaluate Anthropic's web search tool as a supplement (not a replacement) for the ingestion pipeline — see the ADR for the reasoning on why it can't replace Epic 05's structured data.

## Acceptance Criteria

- [ ] A real question submitted through the Q&A panel gets a real, non-fabricated answer.
- [ ] No AI provider API key appears in any browser-visible network request.
- [ ] Every exchange is logged.
