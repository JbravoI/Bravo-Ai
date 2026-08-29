# ADR 0003: Ship API Routes Against Seed Data Before A Database Exists

## Status

Accepted, and resolved — `0004-mongodb-atlas-not-postgres.md` records the database that eventually filled this gap (MongoDB Atlas, not Postgres as this ADR's title assumed at the time). This document is kept as-is for the historical reasoning; it's no longer describing current state.

## Context

Provisioning a real Postgres database requires an external account (Supabase, Neon, etc.) and credentials that weren't available mid-session when a documented, testable API surface was needed. `STRATEGY.md`'s Phase 2 bundles "stand up Postgres" and "build `/api/regulations`, `/api/audit`, `/api/preferences` routes" together as one phase.

## Decision

Split that bundling. Build real Next.js Route Handlers (`app/src/app/api/regulations`, `/api/audit`, `/api/impact`, `/api/jurisdictions`, `/api/scan`, `/api/query`) now, backed by the existing `app/src/lib/data.ts` seed data instead of a database, and document them with a real OpenAPI spec and Swagger UI (`/api-docs`). Defer the database swap to when one is actually provisioned.

This is treated as legitimate progress, not a shortcut around "not a demo again": every route is real, callable, independently testable HTTP infrastructure — it returns actual JSON over actual HTTP, with real status codes (400/404/501 included) — it simply reads from an in-memory array instead of a database for now. Every route and the OpenAPI spec's `info.description` say so explicitly.

## Consequences

- `../../implementation/epic-02-backend-data-model/index.md` was `Ongoing`, not `Completed`, for as long as this gap existed — resolved once MongoDB Atlas landed (see ADR 0004).
- `POST /api/scan` responds with `"simulated": true` in its body. At the time of this ADR, `POST /api/query` responded `501` rather than a fake answer. That was superseded by the real Gemini-backed Epic 04 implementation; `/api/query` returns `501` only if its server-side key is not configured.
- The route contracts (URL, method, response shape) were designed against `../architecture/03-data-model.md`'s target schema, which is why swapping the backing store turned out to be additive (one file, `app/src/lib/data.ts`) rather than a rewrite — this held true even though the actual database chosen (MongoDB) differed from what was planned when this ADR was written.
