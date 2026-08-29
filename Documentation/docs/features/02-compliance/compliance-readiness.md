# Feature: Compliance Readiness

## Product Intent

Show, at a glance, how prepared the firm is for every tracked regulation — status, deadline and a readiness percentage — so nothing near its deadline gets missed.

## Current Behavior

- `/compliance` renders `app/src/components/ComplianceTable.tsx`: one row per regulation with title, regulator, status badge, deadline, a readiness progress bar (green ≥70%, amber ≥40%, red below), and priority badge.
- Rows open the same `RegulationModal` used by the alerts feed.
- Table rows are keyboard-operable (`role="button"`, `tabIndex={0}`, Enter/Space handling) since a `<button>` cannot legally wrap a `<tr>`.

## Known Gaps

- Readiness percentages are hard-coded per seed regulation, not derived from any real assessment workflow — there is no UI yet for a compliance officer to update a regulation's readiness themselves.
- No sorting or filtering on this table yet (by deadline proximity, priority, or regulator).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Compliance readiness"
- Gherkin: `../../../features/02-compliance/compliance-readiness.feature`
- Implementation: `../../../implementation/epic-01-app-skeleton/`, `../../../implementation/epic-02-backend-data-model/`
