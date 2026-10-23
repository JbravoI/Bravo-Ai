# Epic 10: Compliance Assessment And Score Model

**Status:** `Implemented`
**Maps To:** `../../STRATEGY.md` Phase 10
**Target Surface(s):** Compliance table, regulation detail modal, Dashboard score, `compliance_assessments`

---

## Delivered

- Append-only compliance assessments containing owner, status, readiness percentage, evidence/reference, rationale, next review date, assessor and timestamp.
- Analyst/admin-only assessment submission. The route independently rechecks the current database role and verifies the regulation belongs to the caller's active jurisdiction; viewers retain read-only access.
- Latest-assessment readiness in the Compliance table and Dashboard score. The score is a rounded mean of assessed records only, with an assessed/total denominator; no assessment shows as `Not assessed`, not `0%`.
- Audit-log entry for every inserted assessment.

## Deferred Policy

- Priority/deadline weighting is not applied until the business adopts a documented weighting policy.
