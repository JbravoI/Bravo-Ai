# Current Status

**Updated:** 2026-08-29

This file is the quickest implementation truth for what's real right now. Epic pages remain authoritative for detailed remaining work.

| Capability | Frontend | API | Data | Verification |
| :--- | :---: | :---: | :---: | :--- |
| Bravo Ai branding | Complete | N/A | N/A | Manual: no "RegWatch" text/ids/functions remain in `bravo-ai.html` |
| Dashboard, alerts, filtering | Complete | N/A | Seed (`app/src/lib/data.ts`) | Build + lint clean; all 7 routes return 200 |
| Regulation detail modal | Complete | N/A | Seed | Manual keyboard/click check |
| Compliance readiness table | Complete | N/A | Seed | Build + lint clean |
| Impact map | Complete | N/A | Seed | Build + lint clean |
| Audit trail (display only) | Complete | N/A | Seed, static | Build + lint clean |
| Preferences / jurisdictions (unpersisted) | Complete | N/A | Local component state | Build + lint clean |
| `GET /api/regulations`, `/{id}`, `/audit`, `/impact`, `/jurisdictions` | N/A | Complete | Seed | Hit directly, checked 200/400/404 responses |
| `POST /api/scan` | N/A | Simulated | N/A | Hit directly, confirmed `"simulated": true` in body |
| `POST /api/query` | N/A | Stub | N/A | Hit directly, confirmed `501` response |
| OpenAPI spec + Swagger UI (`/api-docs`) | Complete | Complete | N/A | Hit directly; loaded in browser; no console errors |
| UI calling its own API routes | Not started | — | — | UI still imports `app/src/lib/data.ts` directly |
| Postgres database | Not started | — | — | — |
| Auth / per-user persistence | Not started | — | — | — |
| Real AI provider (Anthropic) wired up | Not started | — | — | — |
| Real regulator-source scanning | Not started | — | — | — |
| Automated test suite | Not started | — | — | — |
| Vercel deployment of the real app | Not started | — | — | Only the static prototype has documented deploy steps (`../deployment.md`) |

## Explicitly Remaining

- Epic 02: Postgres provisioning and migration off `app/src/lib/data.ts`; wiring the UI to call its own API routes instead of importing data directly.
- Epic 03: authentication and per-user persistence for preferences/jurisdictions/audit trail.
- Epic 04: real Anthropic integration behind `/api/query`; reconciling `QAPanel.tsx`'s request shape with the real contract.
- Epic 05: a sourcing decision (scrape vs. licensed provider) and the first real ingestion connector (start with one regulator).
- Epic 06: CSP, full modal focus-trap, mobile nav, ISO 8601 dates internally, first automated tests.
- Epic 07: a real Vercel deployment of the Next.js app (not just the static prototype), with env vars and Cron configured.

## Verification Baseline

- `npm run build` and `npm run lint`: clean as of Epic 02.
- No automated unit/integration/e2e tests exist yet — manual verification only, per `../test.md`.
- Every API route has been exercised directly (not just via UI) with both success and error cases.
