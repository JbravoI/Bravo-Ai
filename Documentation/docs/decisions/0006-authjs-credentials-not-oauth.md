# ADR 0006: Auth.js With Credentials, Not OAuth

## Status

Accepted.

## Context

Epic 03 needed real authentication. Two realistic options existed:

1. **OAuth** (Google/GitHub sign-in via Auth.js providers) — the more common choice for a modern app, but requires creating an OAuth app in an external developer console (Google Cloud Console or GitHub Settings) and obtaining a client ID/secret before any code can be written or tested. That's a credential only the account owner can create.
2. **Credentials provider** (email + password, hashed, JWT session) — fully self-contained. No external service, no account signup, nothing to hand over before building and testing the whole flow end-to-end.

Given the pattern of this whole project (Postgres → MongoDB Atlas because a cluster already existed; Firebase → Vercel because free Firebase Hosting couldn't run the app) — prefer the path that doesn't block on an external credential when a self-contained alternative fully satisfies the actual requirement (a user can sign in and the app recognizes them; a second user doesn't see the first user's data).

## Decision

Use Auth.js v5 (`next-auth@beta`) with a single **Credentials** provider: email + password, hashed with `bcryptjs`, **JWT session strategy** (not database sessions — Auth.js's Credentials provider is designed around JWT; combining it with adapter-managed database sessions is explicitly discouraged in Auth.js's own guidance). Session/user identity is carried in a signed JWT cookie, not looked up from a database on every request.

User records live in a `users` collection managed directly (`app/src/lib/users.ts`), not through an Auth.js database adapter — Credentials + JWT doesn't need one, and adding `@auth/mongodb-adapter` would only be exercised for OAuth-style account linking this app doesn't use.

Route gating uses `app/src/proxy.ts` — **not** `middleware.ts`. Next.js 16 deprecated and renamed the `middleware` file convention to `proxy` (same mechanism); this was caught by checking the installed Next.js version's own docs before writing the file, per the framework's own `AGENTS.md` warning that this version has breaking changes from training-era knowledge.

The proxy gates **UI pages only**, not `/api/**`. Epic 02 built the API as an independently-testable public surface (documented, Swagger-browsable, verified via direct HTTP calls including from outside the browser) — gating it now would be a regression against that explicit design goal, and nothing in Epic 03's acceptance criteria requires it.

## Consequences

- Signup is self-service (`/signup` → `POST /api/auth/signup`) — there's no invite system or admin approval step. Acceptable for the current single-tenant, pre-launch stage; revisit if/when multi-tenancy (an open question since `../architecture/03-data-model.md`) is resolved.
- `AUTH_SECRET` is a new required environment variable (JWT signing key), needed everywhere `MONGODB_URI` is needed: `app/.env.local` for local dev, Vercel's dashboard for the deployed runtime, and GitHub Actions secrets for the CI build step — see `../../deployment.md`.
- Preferences (`app/src/lib/preferences.ts`, `user_preferences` collection) are keyed by the JWT's user ID, scoped per-user by construction — verified by creating two accounts and confirming the second saw an empty preferences object rather than the first's saved state.
- Saving a preference now appends a real `audit_log` entry attributed to the user's email (not their opaque database ID, which wouldn't mean anything to a human reviewing the trail) — the first genuinely user-triggered audit entry in the app, previously the audit trail was static seed content or scan-simulation output.
- If OAuth is added later (e.g. for a nicer sign-in UX), it can be added as an additional Auth.js provider alongside Credentials without restructuring the JWT/proxy setup — Auth.js supports multiple providers side by side.

## Note On A Real Production Incident

First deploy to Vercel hit Auth.js's generic `/api/auth/error` "Server error — problem with the server configuration" page immediately on signup. Auth.js's own docs are explicit that `AUTH_SECRET` is a *required* environment variable in production — omitting it throws exactly this generic configuration error rather than a specific "AUTH_SECRET missing" message, which makes it easy to mistake for something else. The fix is adding `AUTH_SECRET` to Vercel's Project Settings → Environment Variables (mirroring `app/.env.local`, which already had it — the miss was in not yet syncing it to the deployed environment, exactly the "two separate places" gotcha `../../deployment.md` warns about for every env var).

The same generic error page is also the documented symptom of Auth.js's `UntrustedHost` check failing. Auth.js says official platform integrations (Vercel included) auto-detect this, but since the symptom is indistinguishable from the missing-secret case without checking logs, `trustHost: true` was added explicitly to `app/src/auth.ts` as a defensive fix — harmless if Vercel's auto-detection was already working, and removes this cause from consideration if it wasn't.

