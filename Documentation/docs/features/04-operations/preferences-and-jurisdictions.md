# Feature: Preferences And Jurisdictions

## Product Intent

Let a user scope the product to the jurisdictions and business areas they actually care about, and control how they're alerted — and have that stick.

## Current Behavior

- `/prefs` renders three sections: `app/src/components/JuriGrid.tsx` (jurisdiction toggle pills: UK, EU, US, Hong Kong, Singapore, Switzerland and Nigeria), static alert-threshold checkboxes, and `app/src/components/PrefsIndustryFocus.tsx` (industry-focus toggle tabs: Banking, Investment, Insurance, Asset Management, Fintech).
- Both toggle components hold local `useState` seeded from the signed-in user's saved preferences (or sensible defaults for a first-time user), and persist every toggle via `PUT /api/preferences` — no longer local-only. See `app/src/lib/preferences.ts`.
- Requires sign-in: `/prefs` (like every UI page) sits behind `app/src/proxy.ts`'s auth gate.
- Each preference save appends a real `audit_log` entry attributed to the user's email.

## Known Gaps

- Nigeria is selectable as `NG`, but it has no enabled ingestion connector yet. Its proposed sources and rollout criteria are in `../research/nigeria-regulatory-sources.md`.
- Only UK and EU have active connector coverage today; the other selectable jurisdictions remain preference-only until their official publication sources are assessed and implemented.
- Alert-threshold checkboxes don't feed into anything yet — no notification system exists.
- Saved jurisdiction/industry-focus preferences aren't yet **applied** anywhere — they persist correctly, but the dashboard/alerts feed doesn't filter by them. That's a separate piece of work from persistence itself (see the Gherkin scenario still marked `@not-yet-built`).

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Preferences and jurisdictions"
- Gherkin: `../../../features/04-operations/preferences-and-jurisdictions.feature`
- Implementation: `../../../implementation/epic-03-auth-persistence/`
