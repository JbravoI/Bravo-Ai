# Feature: Audit Trail

## Product Intent

Give a compliance team a reliable, chronological record of what the system did and when — scans, alerts, preference changes, Q&A queries — so the audit trail can stand up to actual compliance scrutiny, not just look convincing in a demo.

## Current Behavior

- `/audit` renders `components/AuditLog.tsx`: a static, chronological list of seed entries, each with a timestamp, a bold label and a detail line.
- Entries are structured as `{ ts, label, detail }` (see `lib/types.ts`'s `AuditEntry`) specifically so rendering never needs to parse a markup string — see `../../architecture/04-security-privacy.md`.

## Known Gaps

- This is entirely static seed data. Nothing in the app currently appends a real entry — not a scan, not a preference change, not a Q&A exchange.
- `components/TopBar.tsx`'s "Scan Now" button simulates a scan (a timed spinner) but does not write an audit entry, unlike the original prototype's in-memory mutation. This was a deliberate simplification during Epic 01 rather than porting a fake `AUDIT.unshift(...)` forward — see `../../../implementation/epic-01-app-skeleton/index.md`.
- No pagination, search or date filtering.

## What "Real" Looks Like

Per `../../architecture/03-data-model.md`, `audit_log` is append-only and every action that should be traceable — a completed scan, an alert dispatch, a Q&A query, a preference change — writes exactly one row. This is Epic 05 (real ingestion) and Epic 03 (auth/persistence) work, not Epic 04.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Audit trail"
- Gherkin: `../../../features/04-operations/audit-trail.feature`
- Implementation: `../../../implementation/epic-05-real-ingestion/`
