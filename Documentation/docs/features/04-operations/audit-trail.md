# Feature: Audit Trail

## Product Intent

Give a compliance team a reliable, chronological record of what the system did and when — scans, alerts, preference changes, Q&A queries — so the audit trail can stand up to actual compliance scrutiny, not just look convincing in a demo.

## Current Behavior

- `/audit` renders `app/src/components/AuditLog.tsx`: a chronological list of persisted entries, each with a timestamp, a bold label and a detail line.
- Entries are structured as `{ ts, label, detail }` (see `app/src/lib/types.ts`'s `AuditEntry`) specifically so rendering never needs to parse a markup string — see `../../architecture/04-security-privacy.md`.

## Known Gaps

- Every completed FCA scan appends a persisted audit entry with its real completion timestamp and new/changed record counts. The TopBar refreshes the current route after a completed scan so an open audit page reflects the new entry.
- No pagination, search or date filtering.

## What "Real" Looks Like

Per `../../architecture/03-data-model.md`, `audit_log` is append-only and every action that should be traceable — a completed scan, an alert dispatch, a Q&A query, a preference change — writes exactly one row.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Audit trail"
- Gherkin: `../../../features/04-operations/audit-trail.feature`
- Implementation: `../../../implementation/epic-05-real-ingestion/`
