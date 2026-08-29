# ADR 0004: MongoDB Atlas, Not Postgres

## Status

Accepted. Supersedes the database-choice portion of `0001-nextjs-vercel-postgres.md` — that ADR's Next.js/Vercel/single-app reasoning stands unchanged; only the database technology changes.

## Context

ADR 0001 chose Postgres specifically because the compliance/impact/audit views need relational filtering (deadline sorting, multi-field filtering, joins across regulation tags) that a document store tends to fight without denormalization.

That reasoning was sound in the abstract, but it assumed choosing a database from a blank slate. In practice, a MongoDB Atlas cluster already existed (provisioned through Atlas's own onboarding flow, credentials already in hand) before a Postgres provider had been chosen. Provisioning a *second* database service to satisfy an ADR that hadn't yet been acted on would have been process for its own sake — the actual data model (five straightforward collections/tables, no complex multi-table joins, filtering that's one or two fields deep) doesn't need relational joins badly enough to justify standing up a different service that already has a working alternative sitting unused.

## Decision

Use MongoDB Atlas as the database. `app/src/lib/mongodb.ts` holds a cached `MongoClient` connection (reused across Next.js dev hot-reloads, per the standard Next.js + MongoDB pattern). `app/src/lib/data.ts`'s accessor functions (`getRegulations`, `getRegulationById`, `getAuditEntries`, `getImpactRows`, `getJurisdictions`) query four collections — `regulations`, `jurisdictions`, `audit_log`, `impact_rows` — instead of Postgres tables. Every document's shape matches the existing TypeScript types in `lib/types.ts` exactly (including using a plain integer `id` field rather than Mongo's own `_id`, which every query explicitly excludes from projections), so the API contract and OpenAPI spec didn't need to change at all.

`../architecture/03-data-model.md` is rewritten around these four collections.

## Consequences

- `app/scripts/seed.mjs` (run via `npm run seed`) is the one-time (re-runnable/idempotent — it clears each collection before inserting) migration of the original hard-coded sample data into the database. The in-memory seed arrays that used to live in `app/src/lib/data.ts` no longer exist in application code at all; if they're needed again they're in this script or in git history.
- `MONGODB_URI` and `MONGODB_DB` are required environment variables (`app/.env.example` documents them, `app/.env.local` — git-ignored — holds the real values). The app fails fast with a clear error if `MONGODB_URI` is missing, rather than silently falling back to fake data.
- Atlas's Network Access (IP allowlist) must permit whatever environment is connecting — this caused real connection failures during setup (see the note below) and will need the same attention for Vercel's deployment IPs in Epic 07.
- If the compliance/impact/audit views ever need genuinely relational queries that MongoDB's aggregation pipeline can't comfortably express, that's a real signal to revisit — but the current query patterns (filter by one field, sort by one field, findOne by id) don't require it.

## Note On Diagnosing The Initial Connection Failure

Worth recording since it cost real debugging time and the cause wasn't obvious: connection attempts initially failed with a TLS handshake error (`SSL alert internal_error`) that looked identical whether using the SRV-based (`mongodb+srv://`) or a direct standard connection string, which ruled out DNS as the cause. Cloudflare WARP was running locally and was disconnected as a first hypothesis (WARP/Zero-Trust gateways commonly do TLS inspection) — that didn't fix it either. The actual cause was Atlas's Network Access list not yet permitting the connecting IP; Atlas's rejection manifests as a TLS-layer failure rather than a clean connection refusal, which is what made it look like a network/TLS-inspection problem rather than a server-side allowlist issue. Lesson for next time: check Atlas Network Access first when a connection fails at the TLS layer, before chasing local network causes.
