# Epic 08: Information Navigation, Filtering And Alert Acknowledgement

**Status:** `Implemented`
**Maps To:** `../../STRATEGY.md` Phase 8
**Target Surface(s):** Dashboard, Alerts, Compliance Readiness, Impact Map, Audit Trail, Admin Dashboard, `alert_reads`

---

## Delivered

- Shared accessible pagination for Dashboard alerts, Alerts, Compliance, Impact Map and Audit Trail: 10 items by default, with 20, 30 and 50 options plus previous/next controls.
- Dashboard alert sorting (newest, oldest, high-to-low risk) and filters for regulator, risk, status, deadline/review state and industry tags.
- Impact Map sort options (regulation, highest impact, most affected areas) and filters for business area and minimum impact.
- Admin dashboard user-access and password-reset-request filters, sorts, clear actions and shared pagination.
- A jurisdiction-safe bulk acknowledgement at `POST /api/alert-reads` with `{ "action": "mark-all" }`. Entering `/alerts` invokes it, writes only the signed-in user's visible active-jurisdiction regulation ids, returns those ids to update the badge, and creates one audit entry when unread alerts were changed.

## Verification

- TypeScript and ESLint pass.
- Route behavior is covered by manual production checks: navigate to Alerts with unread records; confirm its badge reaches zero, one audit row appears, and switching jurisdictions leaves a previously unseen jurisdiction's badge count intact.
