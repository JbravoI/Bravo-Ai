# Feature: Preferences And Jurisdictions

## Product Intent

Let a user scope the product to the jurisdictions and business areas they actually care about, and control how they're alerted — and have that stick.

## Current Behavior

- `/prefs` renders three sections: `app/src/components/JuriGrid.tsx` (jurisdiction toggle pills: UK, EU, US, Hong Kong, Singapore, Switzerland), static alert-threshold checkboxes, and `app/src/components/PrefsIndustryFocus.tsx` (industry-focus toggle tabs: Banking, Investment, Insurance, Asset Management, Fintech).
- Both toggle components hold their own local `useState` — independent of each other and of any other page, by construction (see the Epic 00 bug-fix note in `../01-monitoring/dashboard-and-alerts.md`).

## Known Gaps

- Nothing here persists. A page refresh resets every toggle to its default state, and there is no per-user distinction at all (no auth yet).
- Only UK and EU jurisdictions have any real scanning behind them planned (Epic 05); the other four toggles are UI-only for the foreseeable future — see `../../product/00-product-vision.md`'s Out Of Scope section.
- Alert-threshold checkboxes don't feed into anything — no notification system exists.

## What "Real" Looks Like

Per `../../architecture/03-data-model.md`, these become `user_preferences` rows, loaded on login and saved on change, and actually applied when filtering alerts or (eventually) sending notifications. This is Epic 03 work.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Preferences and jurisdictions"
- Gherkin: `../../../features/04-operations/preferences-and-jurisdictions.feature`
- Implementation: `../../../implementation/epic-03-auth-persistence/`
