# Epic 03: Auth And Persistence

**Status:** `Completed`
**Maps To:** `../../STRATEGY.md` Phase 3
**Target Surface(s):** `app/src/auth.ts`, `app/src/proxy.ts`, `app/src/lib/users.ts`, `app/src/lib/preferences.ts`, `app/src/app/login/`, `app/src/app/signup/`, MongoDB `users`/`user_preferences` collections

---

## Overview

Gate the app behind login, then make preferences and jurisdictions persist per-user instead of resetting on every page refresh.

---

## Work Completed

- **Auth.js v5 with a Credentials provider** (email/password, `bcryptjs`-hashed, JWT session) — not OAuth, deliberately, to avoid blocking on an external app-registration credential. See `../../docs/decisions/0006-authjs-credentials-not-oauth.md`.
- `app/src/lib/users.ts` — `createUser`/`verifyUser` against a `users` collection, managed directly (no Auth.js database adapter — Credentials + JWT doesn't need one).
- `app/src/auth.ts` — NextAuth config (`handlers`, `auth`, `signIn`, `signOut`), JWT/session callbacks carrying the user's id.
- `app/src/app/api/auth/[...nextauth]/route.ts` and `app/src/app/api/auth/signup/route.ts` — the sign-in/session machinery and self-service signup endpoint.
- `app/src/app/login/page.tsx` and `app/src/app/signup/page.tsx` — real forms, styled with the existing design system, no new component library.
- `app/src/proxy.ts` — gates every UI page behind a valid session, redirecting to `/login`. **Not** `middleware.ts` — Next.js 16 renamed that file convention to `proxy`; caught by checking the installed version's own docs rather than assuming training-era knowledge still applied. Deliberately excludes `/api/**` from the gate — Epic 02's API is a public, independently-testable surface by design, and gating it now would be a regression.
- `app/src/components/AuthSessionProvider.tsx` wraps the app so `useSession()`/`signOut()` work client-side; `TopBar.tsx` shows the signed-in user's email and a real Sign Out button.
- **Per-user preferences**: `app/src/lib/preferences.ts` (`getUserPreferences`/`saveUserPreferences` against a `user_preferences` collection, keyed by user id) and `app/src/app/api/preferences/route.ts` (`GET`/`PUT`, requires a session). `app/src/app/prefs/page.tsx` loads the signed-in user's saved state (falling back to sensible defaults for a first-time user) and passes it to `JuriGrid.tsx`/`PrefsIndustryFocus.tsx`, which now persist every toggle via `PUT /api/preferences` instead of only holding local `useState`.
- **Real audit trail entries**: every preference save appends an `audit_log` entry attributed to the user's email — the first genuinely user-triggered entry in the app (previously all audit content was static seed data or scan-simulation output).

## Verification

- `npm run build` and `npm run lint`: clean. Build output shows `ƒ Proxy (Middleware)`, confirming `proxy.ts` was picked up correctly.
- Full live flow exercised via scripted HTTP requests (not just manual clicking) against a running dev server, with cookies carried across requests to simulate real browser sessions:
  - Unauthenticated `GET /` → `307` redirect; `GET /login` → `200` (correctly excluded from the gate).
  - `POST /api/auth/signup` → account created.
  - Full Auth.js sign-in flow (CSRF token → credentials callback) → session cookie issued; `GET /` and `GET /prefs` then return `200`.
  - `GET /api/preferences` before any save → `{}`; `PUT` with jurisdiction/industry values → `{"ok":true}`; `GET` again → the saved values persisted correctly.
  - `GET /api/audit` → the top entry is the real "Preferences updated" entry, attributed to the test account's email.
  - **Isolation check**: created a second account, signed in as them, `GET /api/preferences` → `{}` — did not see the first account's saved UK/US/Fintech values.
  - **Wrong-password check**: sign-in with an incorrect password → redirected to `/login?error=CredentialsSignin`, no session cookie issued, subsequent `GET /` still `307`-redirects.
  - Dev server log reviewed for the whole run: the only `ERROR` line is the expected `CredentialsSignin` log from the intentional wrong-password test — no unexpected errors.
  - Test accounts and their preference/audit records were removed from the database after verification.

## Acceptance Criteria

- [x] A user can sign in and the app recognizes them across page loads.
- [x] Jurisdiction and industry-focus toggles persist across a page refresh and are scoped to the signed-in user.
- [x] A second signed-in user does not see the first user's preferences.

## Deliberately Out Of Scope

- OAuth sign-in (see ADR 0006 — can be added later as an additional provider without restructuring).
- Invite-only/admin-approved signup — currently self-service, acceptable pre-launch.
- Gating `/api/**` behind auth — Epic 02's public API surface is an intentional design choice, not an oversight.
- Multi-tenant `org_id` scoping — still an open question in `../../docs/architecture/03-data-model.md`.
