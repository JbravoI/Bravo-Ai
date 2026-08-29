# Epic 02: Backend And Data Model

**Status:** `Completed`
**Maps To:** `../../STRATEGY.md` Phase 2
**Target Surface(s):** `app/src/app/api/**`, `app/src/lib/data.ts`, `app/src/lib/mongodb.ts`, MongoDB Atlas

---

## Overview

Give the app a real, documented API surface, wire the UI to a single shared data layer instead of duplicating data access, then back that layer with a real database.

---

## Work Completed

- Real Next.js Route Handlers: `GET /api/regulations` (+ `?source=` filter), `GET /api/regulations/{id}`, `GET /api/audit`, `GET /api/impact`, `GET /api/jurisdictions`, `POST /api/scan` (labeled `"simulated": true`), `POST /api/query` (labeled, returns `501`).
- Hand-written OpenAPI 3.0 spec at `GET /api/openapi.json`, describing every route including its current backing store honestly in each operation's description.
- Interactive Swagger UI at `/api-docs`, built on `swagger-ui-dist` (avoids React-version peer-dependency risk of `swagger-ui-react`) served through an allowlisted static-asset route (`app/src/app/swagger-static/[file]/route.ts`) rather than vendoring the bundle into the repo.
- **UI wired to a shared data layer.** `app/src/lib/data.ts` exports async accessor functions (`getRegulations`, `getRegulationById`, `getAuditEntries`, `getImpactRows`, `getJurisdictions`) — both the Route Handlers and the Server Component pages call these directly. This is deliberately **not** a Server Component fetching its own Route Handler over HTTP: Next.js's own docs recommend a shared function instead (see the "Reusing data with `React.cache`" pattern), since a self-fetch needs an absolute URL on the server and adds a pointless network hop within the same process. The Route Handlers remain the real, externally-callable, Swagger-documented API surface for anything outside the app (curl, the Q&A panel's client-side fetch, future integrations) — the UI just doesn't round-trip through its own HTTP layer to reach data that's already in-process.
  - `app/src/app/layout.tsx` fetches the full regulations list once (`getRegulations()`) and provides it through `RegulationModalContext`, so the Dashboard, Alerts, Compliance table, and the regulation detail modal all share one fetch instead of four.
  - `app/src/app/impact/page.tsx`, `audit/page.tsx`, and `prefs/page.tsx` each fetch their own page-scoped data (`getImpactRows`, `getAuditEntries`, `getJurisdictions`) and pass it down as props — `ImpactTable`, `AuditLog`, and `JuriGrid` are presentational components, no longer importing seed data themselves.
- **`QAPanel.tsx` now calls the app's own `/api/query`** (relative URL, client-side `fetch`) instead of the fictional `api.bravoai.app` domain, and surfaces the real error message from the response body — asking a question now shows the actual "AI Q&A is not yet wired up" message from the server instead of a generic network failure.
- **`TopBar.tsx`'s "Scan Now" now calls the real `POST /api/scan`** instead of running its own independent `setTimeout` simulation, and reflects the endpoint's actual (simulated) response.
- **A real database is live: MongoDB Atlas, not Postgres.** See `../../docs/decisions/0004-mongodb-atlas-not-postgres.md` for why this changed from the original plan, and `../../docs/architecture/03-data-model.md` for the current collections. `app/src/lib/mongodb.ts` holds a cached client connection (reused across dev hot-reloads); every accessor function in `app/src/lib/data.ts` now queries a real collection — the in-memory seed arrays no longer exist in application code. `app/scripts/seed.mjs` (`npm run seed`) is the idempotent one-time migration of the original sample data into the database.
- Diagnosed and fixed a real connection blocker during setup: Atlas's Network Access list wasn't yet permitting the connecting IP, which manifested as a TLS handshake failure rather than a clean refusal — see ADR 0004's note for the full diagnostic path (local causes like Cloudflare WARP were ruled out first, since the symptom looked identical to TLS interception).

## Remaining Work

None for this epic. Forward-looking items tracked elsewhere:

- `regulation_versions`, `user_preferences`, `qa_log` collections — planned but owned by Epic 03/04/05 respectively, not this epic (see `../../docs/architecture/03-data-model.md`).
- Reconcile `app/src/components/QAPanel.tsx`'s request/response shape with `/api/query`'s real contract once Phase 4 implements it — Epic 04 work.

## Verification

- `npm run build` and `npm run lint`: clean.
- Every route exercised directly: `GET /api/regulations?source=fca` (200, filtered), `GET /api/regulations/2` (200), `GET /api/regulations/999` (404), `GET /api/audit` (200), `POST /api/scan` (200, `simulated: true`), `POST /api/query` (501), `GET /api/openapi.json` (200), `/swagger-static/swagger-ui-bundle.js` (200), `/api-docs` (200, no console errors).
- After the data-layer wiring: fresh dev server restart (cleared `.next` cache), all 8 routes hit directly (200), dev server log showed zero errors/warnings, opened in browser with no console errors.
- After the MongoDB migration: `npm run seed` populated all 4 collections with the correct document counts (7/6/8/7); `npm run build` succeeded with pages statically prerendering against the live database at build time; fresh dev server restart, full route sweep all 200, `GET /api/regulations` returned all 7 documents, `GET /api/regulations/3` returned the correct document. **Decisive live-connection proof**: edited a document's `readiness` field directly in the database via a throwaway script, confirmed the API immediately returned the new value, then reverted it — rules out any caching or stale in-memory path.

## Acceptance Criteria

- [x] Every planned read/write endpoint exists, is callable, and returns documented status codes including error cases.
- [x] The OpenAPI spec and Swagger UI accurately describe current (not aspirational) backing behavior.
- [x] The UI reads through a single shared data layer instead of duplicating direct imports of seed data across components.
- [x] A real database is provisioned and the data layer queries it instead of in-memory arrays.
