# Current Status

**Updated:** 2026-08-29

This file is the quickest implementation truth for what's real right now. Epic pages remain authoritative for detailed remaining work.

| Capability | Frontend | API | Data | Verification |
| :--- | :---: | :---: | :---: | :--- |
| Bravo Ai branding | Complete | N/A | N/A | Manual: no "RegWatch" text/ids/functions remain in the app (`app/src/app/layout.tsx` metadata, `TopBar.tsx` logo, all component/route names) |
| Dashboard, alerts, filtering | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean; all routes return 200; live DB-edit round-trip confirmed |
| Regulation detail modal | Complete | N/A | MongoDB Atlas, via shared data layer | Manual keyboard/click check |
| Compliance readiness table | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| Impact map | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| Audit trail (display only) | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| Preferences / jurisdictions (unpersisted) | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| `GET /api/regulations`, `/{id}`, `/audit`, `/impact`, `/jurisdictions` | N/A | Complete | MongoDB Atlas | Hit directly, checked 200/400/404 responses against live data |
| `POST /api/scan` | Complete (calls real endpoint) | Simulated | N/A | TopBar calls the real route; hit directly, confirmed `"simulated": true` in body |
| `POST /api/query` | Complete (calls real endpoint) | Stub | N/A | QAPanel calls the real route; hit directly, confirmed `501` response with real error message surfaced in UI |
| OpenAPI spec + Swagger UI (`/api-docs`) | Complete | Complete | N/A | Hit directly; loaded in browser; no console errors |
| UI reading through a shared data layer | Complete | — | — | `app/src/lib/data.ts` accessor functions used by both Route Handlers and Server Component pages; no component imports seed data directly |
| MongoDB Atlas database | Complete | — | — | Connected, seeded (`npm run seed`), and confirmed live via a direct-edit round-trip test — see Epic 02 |
| Auth / per-user persistence | Not started | — | — | — |
| Real AI provider (Anthropic) wired up | Not started | — | — | — |
| Real regulator-source scanning | Not started | — | — | — |
| Automated test suite | Not started | — | — | — |
| Vercel deployment of the real app | Not started | — | — | Deploy steps documented (`../deployment.md`) but not yet executed |

## Explicitly Remaining

- Epic 03: authentication and per-user persistence for preferences/jurisdictions/audit trail (the database this needs is now live).
- Epic 04: real Anthropic integration behind `/api/query`; reconciling `QAPanel.tsx`'s request shape with the real contract.
- Epic 05: a sourcing decision (scrape vs. licensed provider) and the first real ingestion connector (start with one regulator) — the database this writes to is now live.
- Epic 06: CSP, full modal focus-trap, mobile nav, ISO 8601 dates internally, first automated tests.
- Epic 07: a real Vercel deployment of the Next.js app, with env vars (including `MONGODB_URI`) and Cron configured — Atlas's Network Access list will need to permit Vercel's IPs.

## Verification Baseline

- `npm run build` and `npm run lint`: clean as of Epic 02.
- No automated unit/integration/e2e tests exist yet — manual verification only, per `../test.md`.
- Every API route has been exercised directly (not just via UI) with both success and error cases, against the live database.
