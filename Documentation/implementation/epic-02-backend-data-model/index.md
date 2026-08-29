# Epic 02: Backend And Data Model

**Status:** `Ongoing`
**Maps To:** `../../../STRATEGY.md` Phase 2
**Target Surface(s):** `app/api/**`, `lib/data.ts`, Postgres (not yet provisioned)

---

## Overview

Give the app a real, documented API surface, then back it with a real database and wire the UI to call it — replacing `lib/data.ts` as the source of truth.

---

## Work Completed

- Real Next.js Route Handlers: `GET /api/regulations` (+ `?source=` filter), `GET /api/regulations/{id}`, `GET /api/audit`, `GET /api/impact`, `GET /api/jurisdictions`, `POST /api/scan` (labeled `"simulated": true`), `POST /api/query` (labeled, returns `501`).
- All backed by `lib/data.ts` seed data rather than Postgres — see `../../docs/decisions/0003-seed-data-api-before-database.md` for why this split was accepted rather than blocking on database provisioning.
- Hand-written OpenAPI 3.0 spec at `GET /api/openapi.json`, describing every route including its current backing store honestly in each operation's description.
- Interactive Swagger UI at `/api-docs`, built on `swagger-ui-dist` (avoids React-version peer-dependency risk of `swagger-ui-react`) served through an allowlisted static-asset route (`app/swagger-static/[file]/route.ts`) rather than vendoring the bundle into the repo.

## Remaining Work

- Provision a Postgres database (Supabase/Neon/etc. — see `../../docs/architecture/03-data-model.md` for the target schema) and migrate each route from reading `lib/data.ts` to querying it.
- Choose an ORM (Prisma or Drizzle — not yet decided).
- Wire the UI (`app/**/page.tsx`, `components/*`) to actually call these API routes instead of importing `lib/data.ts` directly — currently a real gap, not an oversight (see `../../docs/architecture/02-api-and-client-integration.md`).
- Reconcile `components/QAPanel.tsx`'s placeholder request/response shape with `/api/query`'s eventual real contract (Epic 04 work, but the shapes need to agree).

## Verification

- `npm run build` and `npm run lint`: clean.
- Every route exercised directly: `GET /api/regulations?source=fca` (200, filtered), `GET /api/regulations/2` (200), `GET /api/regulations/999` (404), `GET /api/audit` (200), `POST /api/scan` (200, `simulated: true`), `POST /api/query` (501), `GET /api/openapi.json` (200), `/swagger-static/swagger-ui-bundle.js` (200), `/api-docs` (200, no console errors).

## Acceptance Criteria

- [x] Every planned read/write endpoint exists, is callable, and returns documented status codes including error cases.
- [x] The OpenAPI spec and Swagger UI accurately describe current (not aspirational) backing behavior.
- [ ] Postgres is provisioned and every route reads/writes it instead of `lib/data.ts`.
- [ ] The UI calls its own API instead of importing data directly.
