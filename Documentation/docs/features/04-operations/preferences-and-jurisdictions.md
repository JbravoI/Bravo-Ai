# Feature: Preferences And Jurisdictions

## Product Intent

Let a user scope the product to the jurisdictions and business areas they actually care about, and control how they're alerted — and have that stick.

## Current Behavior

- `/prefs` renders `app/src/components/PreferencesForm.tsx`: a single-choice jurisdiction control (UK, EU, US, Hong Kong, Singapore, Switzerland and Nigeria), multi-select industry-focus tabs, and a save icon/button.
- A user chooses exactly one jurisdiction. The whole preference set is persisted with `PUT /api/preferences` only when they select **Save preferences**; the route rejects a request that supplies zero or multiple jurisdictions. On success the page refreshes from the saved server state. See `app/src/lib/preferences.ts`.
- Requires sign-in: `/prefs` (like every UI page) sits behind `app/src/proxy.ts`'s auth gate.
- Each preference save appends a real `audit_log` entry attributed to the user's email.

## Known Gaps

- Nigeria is selectable as `NG`, but it has no enabled ingestion connector yet. Its proposed sources and rollout criteria are in `../research/nigeria-regulatory-sources.md`.
- Only UK and EU have active connector coverage today; the other selectable jurisdictions remain preference-only until their official publication sources are assessed and implemented.
- Alert delivery controls aren't exposed as editable saved controls yet — no notification system exists.
- Saved jurisdiction/industry-focus preferences aren't yet **applied** anywhere — they persist correctly, but the dashboard/alerts feed doesn't filter by them. That's a separate piece of work from persistence itself (see the Gherkin scenario still marked `@not-yet-built`).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Preferences and jurisdictions"
- Gherkin: `../../../features/04-operations/preferences-and-jurisdictions.feature`
- Implementation: `../../../implementation/epic-03-auth-persistence/`
