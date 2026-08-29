# Epic 05: Real Regulatory-Source Ingestion

**Status:** `Pending`
**Maps To:** `../../STRATEGY.md` Phase 5
**Target Surface(s):** `app/src/app/api/scan/route.ts`, a scheduled job, `regulations` / `regulation_versions` tables

---

## Overview

Replace the seed data and the simulated `/api/scan` with a real pipeline that fetches from FCA/PRA/HM Treasury/EU sources, normalizes them, diffs against the last version, and writes to the database — making "Scan Now" and the audit trail actually true.

---

## Blocked On

- Epic 02's Postgres database.
- A sourcing decision: scrape public regulator sites (generally fine, but check each site's terms) vs. a licensed data provider. Not yet decided — see `../../docs/architecture/03-data-model.md`'s open decisions.

## Planned Work

- Build one source connector first (start with FCA — many regulators publish RSS/Atom feeds or have public APIs), end to end: fetch → normalize → diff against last version → write to `regulations`/`regulation_versions` → append `audit_log` entry.
- Wire `POST /api/scan` to actually invoke this job; remove the `"simulated": true` label once it's real.
- `app/src/components/TopBar.tsx`'s "Last scan" label should reflect the last completed real ingestion run's timestamp, not a static string.
- Every regulation record must carry its source URL and retrieval date — required for a compliance tool to be trustworthy, not optional polish (see `../../docs/architecture/04-security-privacy.md`).
- Add remaining sources (PRA, HM Treasury, EU) once the FCA pattern is proven.
- Vercel Cron Jobs trigger the scan on a schedule (ties into Epic 07).

## Acceptance Criteria

- [ ] Triggering a scan produces real new/changed regulation rows, not a `setTimeout`.
- [ ] Every regulation shown links back to a real source document and retrieval date.
- [ ] The audit trail gets a real entry from every completed scan.
