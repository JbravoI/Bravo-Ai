# Feature: Compliance Readiness

## Product Intent

Show, at a glance, how prepared the firm is for every tracked regulation — status, deadline and a readiness percentage — so nothing near its deadline gets missed.

## Current Behavior

- `/compliance` renders `app/src/components/ComplianceTable.tsx`: one row per regulation with title, regulator, status badge, deadline, a readiness progress bar (green ≥70%, amber ≥40%, red below), latest assessment status and priority badge.
- The table paginates at 10 rows by default. A user can select 10, 20, 30 or 50 rows per page and navigate between pages.
- Selecting a regulation opens an assessment panel. Analysts and administrators can append a readiness assessment with owner, assessment status, readiness percentage, evidence/reference, rationale and optional next review date. Viewers can see the latest assessment but cannot change it.
- Assessments are append-only MongoDB `compliance_assessments` documents. The latest assessment per regulation is used in the selected jurisdiction; the panel identifies its assessor and timestamp.
- The Dashboard Compliance Score is the rounded average of the latest assessment readiness values for assessed regulations in the selected jurisdiction. It displays an em dash when no regulation is assessed and always shows the assessed/total denominator. A record with `0%` is a real assessment and is not treated as “not assessed.”
- Rows open the same `RegulationModal` used by the alerts feed.
- Table rows are keyboard-operable (`role="button"`, `tabIndex={0}`, Enter/Space handling) since a `<button>` cannot legally wrap a `<tr>`.

## Known Gaps

- No sorting or filtering on this table yet (by deadline proximity, priority, or regulator).
- The current score is intentionally unweighted. Agree priority/deadline weighting policy before changing it.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Compliance readiness"
- Gherkin: `../../../features/02-compliance/compliance-readiness.feature`
- Implementation: `../../../implementation/epic-01-app-skeleton/`, `../../../implementation/epic-02-backend-data-model/`
