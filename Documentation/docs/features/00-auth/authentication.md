# Feature: Authentication

## Product Intent

Every other feature in the product is either per-user (preferences, and eventually the audit trail's user attribution) or needs to eventually be gated to real compliance-team members, not anonymous visitors. Authentication is the prerequisite gate, not a feature in its own right — hence Epic 03 bundling it with persistence.

## Current Behavior

- Self-service signup at `/signup` (`POST /api/auth/signup`) — email + password (min 8 characters), hashed with `bcryptjs`, stored in a `users` collection.
- Sign in at `/login` via Auth.js's Credentials provider, JWT session (not database sessions).
- Every UI page requires a valid session — `app/src/proxy.ts` redirects unauthenticated visitors to `/login`. `/login` and `/signup` themselves are excluded from the gate, obviously.
- `/api/**` is **not** gated by the proxy — it remains the public surface Epic 02 built, with one exception: `/api/preferences` checks `auth()` itself and returns `401` without a session, since preferences have no meaningful unauthenticated response.
- `TopBar.tsx` shows the signed-in user's email and a working Sign Out button (`signOut()` from `next-auth/react`).

## Known Gaps

- No OAuth (Google/GitHub sign-in) — Credentials-only, a deliberate choice to avoid needing external app-registration credentials before building anything. See `../../decisions/0006-authjs-credentials-not-oauth.md`.
- No email verification, password reset, or account recovery flow.
- Signup is unrestricted/self-service — no invite system or admin approval, acceptable for the current pre-launch, single-tenant stage.
- No rate limiting on login/signup attempts.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → "Authentication"
- Gherkin: `../../../features/00-auth/authentication.feature`
- Implementation: `../../../implementation/epic-03-auth-persistence/`
