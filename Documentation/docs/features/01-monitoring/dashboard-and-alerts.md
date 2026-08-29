# Feature: Dashboard And Alerts

## Product Intent

Give a compliance officer a single view of what's changed and what needs attention: high-level stats, then a filterable feed of regulatory updates they can drill into for a full summary and business impact.

## Current Behavior

- The dashboard (`/`) shows four stat cards (regulations tracked, high priority, pending review, compliance score) followed by the full alerts feed and the AI Q&A panel.
- The alerts page (`/alerts`) shows the same feed at full width, without the stat cards.
- Both pages filter by source (All/FCA/PRA/HM Treasury/EU/Global) via `components/AlertsSection.tsx`, which holds its own filter state — each route's filter is independent by construction, not shared.
- Clicking an alert card opens `components/RegulationModal.tsx` via `context/RegulationModalContext.tsx`, showing the AI summary, business impact and affected-area tags for that regulation.
- Alert cards are real `<button>` elements (not clickable `<div>`s), keyboard-operable, with visible focus rings.

## Known Gaps

- Stat card numbers (248 regulations tracked, 7 high priority, etc.) are hard-coded, not computed from `REGULATIONS`.
- The feed is the same 7 seed regulations everywhere — no live scan populates it.
- The regulation modal has basic focus-on-open and Escape-to-close, but not a full focus trap or focus restoration on close — that's explicit Epic 06 (hardening) scope, not an oversight.

## Historical Bug Fixed

The original prototype's filter-tab handler selected every `.ftab` element on the page, so clicking a Dashboard/Alerts filter tab silently cleared the unrelated Preferences → Industry Focus toggle state. Fixed during Epic 00 by scoping the query; structurally impossible to recur now since Dashboard, Alerts and Preferences are separate route components with independent state.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Dashboard and alerts"
- Gherkin: `../../../features/01-monitoring/dashboard-and-alerts.feature`
- Implementation: `../../../implementation/epic-01-app-skeleton/`, `../../../implementation/epic-02-backend-data-model/`
