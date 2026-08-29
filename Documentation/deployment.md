# Bravo Ai — Deploying to Vercel

The Next.js app lives in the `app/` subfolder (not the repo root) — see the repo root restructuring (`app/` holds everything code-related, `Documentation/` holds everything else).

> The static `bravo-ai.html` prototype that used to offer a quick no-backend preview has been removed — the real Next.js app (Epic 01) fully supersedes it and is what you should deploy/preview from now on.

Firebase was evaluated as a deploy target (see `docs/decisions/0005-vercel-not-firebase-hosting.md`) and rejected: free Firebase Hosting is static-files-only and can't run `app/api/**` or per-request MongoDB queries; the Firebase products that can (App Hosting, Cloud Functions) require the paid Blaze plan. Vercel's free Hobby tier already supports everything this app does at no cost.

## One-time Vercel project setup

1. In the Vercel dashboard: **New Project → Import** the `JbravoI/Bravo-Ai` GitHub repo.
2. **Before deploying**, set **Root Directory** to `app` in the project's settings (Vercel auto-detects Next.js once it looks in the right folder).
3. Add environment variables in **Project Settings → Environment Variables** — `MONGODB_URI`, `MONGODB_DB`, and `AUTH_SECRET` (all required now, see `app/.env.example`), plus `ANTHROPIC_API_KEY` once Epic 04 needs it. These never go in the repo. Atlas's Network Access list needs to permit Vercel's deployment IPs (in practice, `0.0.0.0/0` — Vercel's serverless function IPs aren't fixed).

## Automated deploy via GitHub Actions

`.github/workflows/deploy.yml` (repo root) builds and deploys to production on every push to `main`, using the Vercel CLI (`vercel pull` → `vercel build` → `vercel deploy --prebuilt`) rather than Vercel's own passive Git integration — this gives explicit CI control (the workflow runs `npm run lint` as a fail-fast gate before deploying).

**If Vercel's own Git integration is also connected** (step 1 above connects it by default), pushing to `main` triggers *two* deployments — Vercel's automatic one and this workflow's. They'll produce identical output, just redundant. To avoid that, either disable automatic Git deployments in **Project Settings → Git** (keep the Action as the sole deploy path), or remove `.github/workflows/deploy.yml` and rely on Vercel's own integration instead (simpler, but loses the explicit lint-gate-before-deploy behavior).

### Required GitHub Actions secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Where to get it |
| :--- | :--- |
| `VERCEL_TOKEN` | vercel.com/account/tokens — create a token scoped to this project/team |
| `VERCEL_ORG_ID` | Run `vercel link` once locally from inside `app/` (after `vercel login`) — reads from the generated `app/.vercel/project.json`. Also visible in the dashboard. |
| `VERCEL_PROJECT_ID` | Same source as above, same file |
| `MONGODB_URI` | Same Atlas connection string as `app/.env.local` — needed because several pages statically prerender against live data at build time, and `vercel build` runs locally in the Action, not on Vercel's servers, so Vercel's own dashboard env vars aren't injected into it |
| `MONGODB_DB` | `bravo_ai` (or whatever you're using) |
| `AUTH_SECRET` | Same value as `app/.env.local` — required by Auth.js (Epic 03) even during the build, since the root layout and gated pages import `app/src/auth.ts` transitively |

**Note the two separate places `MONGODB_URI`/`MONGODB_DB`/`AUTH_SECRET` each need to exist**: once as a GitHub Actions secret (for the CI build step above), and once in Vercel's own **Project Settings → Environment Variables** (for the deployed serverless functions/SSR to actually connect and sign sessions at runtime). They're independent — setting one doesn't set the other. Missing any of them produces a build failure with a clear "X is not set" error, not a silent fallback — if that happens, check both places before assuming something else is wrong.

## Other

Cloud cron (Epic 05's scheduled ingestion) uses **Vercel Cron Jobs**, configured via a `vercel.json` inside `app/` hitting `/api/scan` on a schedule — not yet added.

This is buildable and deployable today (Epics 01-02 are complete) — the workflow exists and is verified to parse as valid YAML, but hasn't been run against real Vercel credentials yet since those are being supplied outside this session. See `implementation/CURRENT_STATUS.md` for what's real once it is.
