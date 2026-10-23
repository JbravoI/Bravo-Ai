# Feature: Dashboard And Alerts

## Product Intent

Give a compliance officer a single view of what's changed and what needs attention: high-level stats, then a filterable feed of regulatory updates they can drill into for a full summary and business impact.

## Current Behavior

- The dashboard (`/dashboard`) derives its regulations-tracked, high-priority, pending-review and average-readiness metrics from the stored regulations, followed by the full alerts feed and the AI Q&A panel.
- The alerts page (`/alerts`) shows the same feed at full width, without the stat cards.
- Both pages filter by the regulatory bodies present in the selected jurisdiction via `app/src/components/AlertsSection.tsx`, which holds its own filter state — each route's filter is independent by construction, not shared.
- The Dashboard adds client-side controls for publication date (newest/oldest), risk, status, deadline/review state and industry tag. A clear action restores the full active-jurisdiction feed; an explicit empty state distinguishes no matching records from a regulator that returned no publication.
- The Dashboard and Alerts feed paginate at 10 records by default. Users can select 10, 20, 30 or 50 records per page and move between pages without changing their selected jurisdiction.
- Clicking an alert card opens `app/src/components/RegulationModal.tsx` via `app/src/context/RegulationModalContext.tsx`, showing the AI summary, business impact and affected-area tags for that regulation.
- The Alerts navigation badge shows the signed-in user's unread regulation count, not a fixed number. Opening an alert marks it read for that user and reduces the badge; this state is persisted in MongoDB's `alert_reads` collection.
- Opening `/alerts` acknowledges every unread alert in the user's currently selected jurisdiction. The authenticated server operation only writes reads for records visible in that jurisdiction (including the user's optional Nigeria records), appends one audit entry when it changes anything, and returns the affected ids so the badge becomes zero without a refresh. Newly ingested records remain unread.
- Alert cards are real `<button>` elements (not clickable `<div>`s), keyboard-operable, with visible focus rings.

## Known Gaps

- The regulation modal has basic focus-on-open and Escape-to-close, but not a full focus trap or focus restoration on close — that's explicit Epic 06 (hardening) scope, not an oversight.

## Historical Bug Fixed

The original prototype's filter-tab handler selected every `.ftab` element on the page, so clicking a Dashboard/Alerts filter tab silently cleared the unrelated Preferences → Industry Focus toggle state. Fixed during Epic 00 by scoping the query; structurally impossible to recur now since Dashboard, Alerts and Preferences are separate route components with independent state.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Dashboard and alerts"
- Gherkin: `../../../features/01-monitoring/dashboard-and-alerts.feature`
- Implementation: `../../../implementation/epic-01-app-skeleton/`, `../../../implementation/epic-02-backend-data-model/`
