# ADR 0003: Ship API Routes Against Seed Data Before Postgres Exists

## Status

Accepted.

## Context

Provisioning a real Postgres database requires an external account (Supabase, Neon, etc.) and credentials that weren't available mid-session when a documented, testable API surface was needed. `STRATEGY.md`'s Phase 2 bundles "stand up Postgres" and "build `/api/regulations`, `/api/audit`, `/api/preferences` routes" together as one phase.

## Decision

Split that bundling. Build real Next.js Route Handlers (`app/src/app/api/regulations`, `/api/audit`, `/api/impact`, `/api/jurisdictions`, `/api/scan`, `/api/query`) now, backed by the existing `app/src/lib/data.ts` seed data instead of a database, and document them with a real OpenAPI spec and Swagger UI (`/api-docs`). Defer the Postgres swap to when a database is actually provisioned.

This is treated as legitimate progress, not a shortcut around "not a demo again": every route is real, callable, independently testable HTTP infrastructure — it returns actual JSON over actual HTTP, with real status codes (400/404/501 included) — it simply reads from an in-memory array instead of a database for now. Every route and the OpenAPI spec's `info.description` say so explicitly.

## Consequences

- `../../implementation/epic-02-backend-data-model/index.md` is `Ongoing`, not `Completed` — the routes exist, Postgres does not.
- `POST /api/scan` responds with `"simulated": true` in its body. `POST /api/query` responds `501` rather than a fake answer. Neither may silently start pretending to be real without the underlying capability actually existing.
- Swapping `app/src/lib/data.ts` reads for Postgres queries inside each route handler is additive, not a rewrite — the route contracts (URL, method, response shape) were designed to `../architecture/03-data-model.md`'s target schema so they don't need to change shape when the database lands.
- The UI still doesn't call these routes (see `../architecture/02-api-and-client-integration.md`'s "Current Gap") — that rewire is separate remaining work under the same epic.
