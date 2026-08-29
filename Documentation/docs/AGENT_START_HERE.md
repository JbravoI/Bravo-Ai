# Agent Start Here

This file is the navigation contract for humans and LLM agents working in this repository.

## Reading Order

1. `../README.md` (Documentation root) for how this structure relates to `STRATEGY.md` and the other root planning documents.
2. `product/00-product-vision.md` for product intent.
3. `architecture/01-architecture.md` for system shape.
4. `architecture/02-api-and-client-integration.md` before touching `app/src/app/api/**` or any component that fetches from it.
5. `architecture/04-security-privacy.md` before touching AI Q&A, secrets, or any `innerHTML`/`dangerouslySetInnerHTML` usage.
6. `../features/AGENT_INDEX.md` for executable behavior specs.
7. `../implementation/AGENT_INDEX.md` for current epic status and build sequence.
8. `../implementation/CURRENT_STATUS.md` for the fast "what's actually real right now" ledger.

Framework-level agent notes (Next.js version-specific conventions) live in `../../app/AGENTS.md` and `../../app/CLAUDE.md` — a separate, Next.js-managed concern from this product documentation.

## Source Of Truth Rules

- Product decisions live in `product/` and `decisions/`.
- User-visible feature descriptions live in `features/`.
- Gherkin acceptance behavior lives in `../features/`.
- Build sequencing and implementation status live in `../implementation/`.
- `../implementation/CURRENT_STATUS.md` is the fast current-truth ledger; detailed epic pages own remaining-work status.
- Runtime code should follow the implementation epics only after checking the matching product docs and feature specs.

## When Building

Before editing code for a feature:

1. Read the matching `features/**` file.
2. Read the matching `../features/**.feature` file.
3. Read the matching `../implementation/epic-*/index.md`.
4. Check whether the epic status is `Pending`, `Ongoing` or `Completed`.
5. Update all three planning surfaces when behavior changes.

## Current Priority

Bravo Ai is a UK financial regulatory monitoring dashboard, mid-migration from a static single-file prototype to a real Next.js application. The active build sequence is the phase order in `../STRATEGY.md`, tracked epic-by-epic under `../implementation/`:

- Rebrand and baseline hygiene: `../implementation/epic-00-rebrand-baseline/` — **Completed**.
- App skeleton (real routes, components, a11y basics): `../implementation/epic-01-app-skeleton/` — **Completed**.
- Backend and data model: `../implementation/epic-02-backend-data-model/` — **Completed** (API routes documented via OpenAPI/Swagger at `/api-docs`, backed by a live MongoDB Atlas database — not Postgres, see `decisions/0004-mongodb-atlas-not-postgres.md`).
- Auth and persistence: `../implementation/epic-03-auth-persistence/` — **Completed** (Auth.js Credentials/JWT, route gating via `proxy.ts` — not `middleware.ts`, deprecated in Next.js 16 — and per-user preferences; see `decisions/0006-authjs-credentials-not-oauth.md`).
- Secure AI Q&A, real ingestion, hardening, and deploy: **Pending** — see the corresponding epics.

Do not infer that AI Q&A works from the UI alone — check `../implementation/CURRENT_STATUS.md` for the current, code-verified truth.
