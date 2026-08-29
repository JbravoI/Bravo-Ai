# Epic 03: Auth And Persistence

**Status:** `Pending`
**Maps To:** `../../../STRATEGY.md` Phase 3
**Target Surface(s):** Auth.js (or equivalent), `app/api/**`, Postgres `user_preferences`

---

## Overview

Gate the app behind login, then make preferences, jurisdictions and the audit trail persist per-user instead of resetting on every page refresh.

---

## Blocked On

Epic 02's Postgres database — there is nowhere to persist a session or a preference until it exists.

---

## Planned Work

- Add authentication (Auth.js or an equivalent Vercel/Next-native library — not yet chosen).
- Wire `components/JuriGrid.tsx` and `components/PrefsIndustryFocus.tsx` to `user_preferences`, loaded on login and saved on change, replacing their current local `useState`.
- Audit trail re-renders from the database and updates immediately after any action (scan, preference change, Q&A) instead of only reflecting static seed content.
- Decide: single-org or multi-tenant (`org_id` scoping) — currently an open question, see `../../docs/architecture/03-data-model.md`.

## Acceptance Criteria

- [ ] A user can sign in and the app recognizes them across page loads.
- [ ] Jurisdiction and industry-focus toggles persist across a page refresh and are scoped to the signed-in user.
- [ ] A second signed-in user does not see the first user's preferences.
