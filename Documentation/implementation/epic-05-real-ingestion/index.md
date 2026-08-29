# Epic 05: Real Regulatory-Source Ingestion

**Status:** `Implemented — awaiting configured-environment scan`
**Maps To:** `../../STRATEGY.md` Phase 5
**Target Surface(s):** `app/src/app/api/scan/route.ts`, a scheduled job, `regulations` / `regulation_versions` collections

---

## Overview

Replace the simulated `/api/scan` with a real pipeline. FCA, PRA, HM Treasury and ESMA (EU) public feeds now use the same fetch, normalize, deduplicate, version and audit pattern.

---

## Implemented

- `app/src/lib/ingest/fca.ts` fetches FCA's public RSS feed (`https://www.fca.org.uk/news/rss.xml`) with a timeout, validates each source URL is HTTPS on `www.fca.org.uk`, normalizes up to 30 entries, and records `sourceUrl` plus `retrievedAt`.
- `app/src/lib/ingest/sources.ts` adds public feeds for PRA (Bank of England), HM Treasury (GOV.UK Atom) and ESMA (EU RSS). A single scan runs all four sources and reports combined new/changed totals.
- Each item is matched using an FCA source identifier. New items are inserted into `regulations`; changed content is updated and recorded in `regulation_versions`; unchanged content only receives an updated retrieval time.
- Every completed run creates a `scan_runs` record and exactly one append-only `audit_log` entry with the actual new/changed counts.
- `POST /api/scan` starts the authenticated scan. `GET /api/scan` reports the latest completed run to the TopBar, which shows the real timestamp plus the new/changed counts and refreshes the current view after a manual scan.
- `app/vercel.json` schedules `GET /api/scan` daily at 02:00 UTC, which is compatible with Vercel Hobby. Vercel Cron must be configured with the same `CRON_SECRET` set in the deployment environment.

## Acceptance Criteria

- [ ] Triggering a scan produces real new/changed FCA regulation rows, not a `setTimeout` (implementation complete; verify after `MONGODB_URI` is configured in the target environment).
- [ ] Every FCA-ingested regulation links back to the real source document and records its retrieval date (implemented; verify with the first completed scan).
- [ ] The audit trail gets a real entry from every completed scan (implemented; verify with the first completed scan).

## Remaining Follow-up

- Add PRA, HM Treasury and EU connectors after confirming their preferred public feeds or licensed-provider arrangements.
- Configure `CRON_SECRET` in Vercel before relying on the daily scheduled scan; manual authenticated scans work without it.
