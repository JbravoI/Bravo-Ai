# Current Status

**Updated:** 2026-08-29

This file is the quickest implementation truth for what's real right now. Epic pages remain authoritative for detailed remaining work.

| Capability | Frontend | API | Data | Verification |
| :--- | :---: | :---: | :---: | :--- |
| Public landing page | Complete | N/A | N/A | Figma-referenced visual implementation; local browser preview verified at `/` |
| Bravo Ai branding | Complete | N/A | N/A | Manual: no "RegWatch" text/ids/functions remain in the app (`app/src/app/layout.tsx` metadata, `TopBar.tsx` logo, all component/route names) |
| Dashboard, alerts, filtering | Complete (`/dashboard`) | N/A | MongoDB Atlas, via shared data layer | Local redirect check confirms `/dashboard` is authenticated; existing build/lint and live DB-edit checks remain valid |
| Regulation detail modal | Complete | N/A | MongoDB Atlas, via shared data layer | Manual keyboard/click check |
| Compliance readiness table | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| Impact map | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| Audit trail (display only) | Complete | N/A | MongoDB Atlas, via shared data layer | Build + lint clean |
| Preferences / jurisdictions (persisted, per-user) | Complete | Complete | MongoDB Atlas | Full scripted login/save/reload/isolation flow verified — see Epic 03 |
| `GET /api/regulations`, `/{id}`, `/audit`, `/impact`, `/jurisdictions` | N/A | Complete | MongoDB Atlas | Hit directly, checked 200/400/404 responses against live data |
| `GET`/`POST /api/scan` | Complete | Implemented — authenticated FCA RSS ingestion | MongoDB `regulations`, `regulation_versions`, `scan_runs`, `audit_log` | FCA feed endpoint verified live (HTTP 200, 20 items); live database-write verification awaits `MONGODB_URI` in the target environment |
| `POST /api/query` | Complete | Complete | Gemini 3.6 Flash + MongoDB `qa_log` | Authenticated server-side provider call; process-local free-tier guard, timeout/retry handling, and audit logging implemented. Requires `GEMINI_API_KEY`. |
| OpenAPI spec + Swagger UI (`/api-docs`) | Complete | Complete | N/A | Hit directly; loaded in browser; no console errors |
| UI reading through a shared data layer | Complete | — | — | `app/src/lib/data.ts` accessor functions used by both Route Handlers and Server Component pages; no component imports seed data directly |
| MongoDB Atlas database | Complete | — | — | Connected, seeded (`npm run seed`), and confirmed live via a direct-edit round-trip test — see Epic 02 |
| Auth (sign up / sign in / sign out / route gating) | Complete | Complete | MongoDB Atlas `users` | Full scripted flow: signup, CSRF+credentials login, gated redirect, wrong-password rejection — see Epic 03 |
| Real AI provider (Gemini 3.6 Flash) wired up | Complete | Complete | `GEMINI_API_KEY`; MongoDB `qa_log` | Server-side only; API key and model confirmed locally without being exposed. |
| Real regulator-source scanning | Implemented — FCA | Implemented | MongoDB Atlas | Normalizes FCA RSS entries with source URL/retrieval date, detects content changes, and records scan/audit history; first database-write verification plus PRA/HMT/EU follow-up remain |
| Automated test suite | Not started | — | — | — |
| Vercel deployment of the real app | Not started | — | — | Deploy steps documented (`../deployment.md`) but not yet executed |

## Explicitly Remaining

- Epic 04 is complete. Structured citations and a distributed rate limiter are deferred hardening work.
- Epic 05: FCA is live. Add PRA, HM Treasury and EU connectors after choosing their feeds or a licensed provider; configure `CRON_SECRET` in Vercel for scheduled scans.
- Epic 06: implemented — CSP/security headers, modal focus trap/restoration, mobile navigation/table scrolling, ISO date handling and first automated tests. Run `npm run migrate:dates` against existing databases before treating the date migration as complete.
- Epic 07: a real Vercel deployment of the Next.js app, with env vars (`MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`) and Cron configured — Atlas's Network Access list will need to permit Vercel's IPs.

## Verification Baseline

- `npm run build` and `npm run lint`: clean as of Epic 03.
- No automated unit/integration/e2e tests exist yet — manual verification only, per `../test.md`.
- Every API route has been exercised directly (not just via UI) with both success and error cases, against the live database.
- Auth flows verified via scripted HTTP requests with real cookie sessions (signup, login, gated redirects, wrong-password rejection, two-account isolation) — not just manual clicking. See Epic 03.
