# Feature: Preferences And Jurisdictions

## Product Intent

Let a user scope the product to the jurisdictions and business areas they actually care about, and control how they're alerted — and have that stick.

## Current Behavior

- `/prefs` renders `app/src/components/PreferencesForm.tsx`: a single-choice jurisdiction control (UK, EU, US, Hong Kong, Singapore, Switzerland and Nigeria), multi-select industry-focus tabs, and a save icon/button.
- A user chooses exactly one jurisdiction. The whole preference set is persisted with `PUT /api/preferences` only when they select **Save preferences**; the route rejects a request that supplies zero or multiple jurisdictions. On success the page refreshes from the saved server state. See `app/src/lib/preferences.ts`.
- The dashboard, alerts, compliance table, impact map and AI context use records only from that saved jurisdiction. The Alerts filter bar is populated from the regulatory bodies represented in those records, so it never shows another jurisdiction's bodies (for example, Nigeria shows CBN, SEC, NAICOM, PenCom and FRC, not FCA or PRA).
- When Nigeria is selected, a user may additionally opt into NDIC, FCCPC, NDPC, NFIU and NGX RegCo. Saving newly selected bodies starts a scan of their official publication pages and stores the results only for that user. These temporary records are deleted when they explicitly sign out or the five-minute inactivity timer signs them out; they are never shared with other users.
- Selected optional Nigeria bodies remain visible as regulator filters even when their latest scan has no usable records or is blocked. Selecting one shows a clear empty state and directs the user to save preferences to retry the scan.
- Requires sign-in: `/prefs` (like every UI page) sits behind `app/src/proxy.ts`'s auth gate.
- Each preference save appends a real `audit_log` entry attributed to the user's email.

## Known Gaps

- Nigeria is active as `NG`. Choosing it scopes the dashboard, alerts, compliance table, impact map and AI context to Nigeria records. Live coverage includes CBN MPC decisions, SEC Nigeria circulars, and NAICOM, PenCom and FRC publications; the source register and remaining rollout are in `../research/nigeria-regulatory-sources.md`.
- Only UK and EU have active connector coverage today; the other selectable jurisdictions remain preference-only until their official publication sources are assessed and implemented.
- Alert delivery controls aren't exposed as editable saved controls yet — no notification system exists.
- Industry focus is saved for future relevance and notification rules; it does not yet narrow the displayed regulation feed.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Preferences and jurisdictions"
- Gherkin: `../../../features/04-operations/preferences-and-jurisdictions.feature`
- Implementation: `../../../implementation/epic-03-auth-persistence/`
