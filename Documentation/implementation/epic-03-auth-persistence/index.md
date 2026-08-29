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

## Bugs Found After First Deploy

The scripted verification above exercised Auth.js's redirect mechanism directly via HTTP (following its 302 response) — it did **not** exercise `LoginPage`/`SignupPage`'s own client-side code, which called `signIn(..., { redirect: false })` and then manually `router.push("/")`. Two real issues surfaced only once a real browser hit the deployed app:

1. **Stuck on `/login` after a successful sign-in.** The manual `router.push("/")` after a successful `redirect: false` response did not reliably navigate away, even though the session was set correctly (`TopBar` showed the signed-in email while the page content was still the login form — the client-side session context updated, but the router never transitioned). Fixed by removing the manual redirect entirely: both pages now call `signIn(..., { callbackUrl: "/" })` with Auth.js's default `redirect: true`, which performs a real browser navigation via the server's redirect response — the same mechanism already proven in the scripted tests above. `LoginPage` now reads the `?error=` query param (via `useSearchParams`, wrapped in `<Suspense>`) to show the failure message instead of relying on a parsed JS response.
2. **`/api/auth/error` "Server error — problem with the server configuration"** on the first production deploy. Auth.js requires `AUTH_SECRET` in production and throws this generic error (not a specific "secret missing" message) if it's absent — likely just not yet synced from `app/.env.local` into Vercel's dashboard. `trustHost: true` was also added to `app/src/auth.ts` defensively, since an `UntrustedHost` check failure produces the identical generic error page. See `../../docs/decisions/0006-authjs-credentials-not-oauth.md`'s incident note.

**Lesson**: scripted HTTP verification of an auth flow can pass completely while the actual client-side page code is broken, if the script exercises the underlying protocol rather than the specific UI code path. Re-verified after the fix: build/lint clean, `/login?error=CredentialsSignin` renders the error banner, and a fresh signup+login round-trip still returns `200` on protected pages.

## Acceptance Criteria

- [x] A user can sign in and the app recognizes them across page loads.
- [x] Jurisdiction and industry-focus toggles persist across a page refresh and are scoped to the signed-in user.
- [x] A second signed-in user does not see the first user's preferences.

## Deliberately Out Of Scope

- OAuth sign-in (see ADR 0006 — can be added later as an additional provider without restructuring).
- Invite-only/admin-approved signup — currently self-service, acceptable pre-launch.
- Gating `/api/**` behind auth — Epic 02's public API surface is an intentional design choice, not an oversight.
- Multi-tenant `org_id` scoping — still an open question in `../../docs/architecture/03-data-model.md`.
