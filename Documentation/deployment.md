# Bravo Ai — Deploying to Vercel

There are two different things this can mean: deploying the static `bravo-ai.html` prototype, or deploying the real Next.js app. Both now live under `app/` (see the repo root restructuring — `app/` holds everything code-related, `Documentation/` holds everything else).

## Quick option: get `bravo-ai.html` live (no backend, just to view/share it)

1. Install the CLI: `npm i -g vercel`
2. From inside `app/`, copy `bravo-ai.html` to a temporary `index.html` (Vercel serves `index.html` at the root by default; otherwise it'd only be reachable at `/bravo-ai.html`) — or pass `vercel --name` and accept the `/bravo-ai.html` path.
3. Run `vercel` from within `app/` and follow the prompts — it'll ask you to log in (opens a browser for auth) and confirm project settings. Since this deploys it as a static file, accept the defaults.
4. It prints a live URL immediately, and `vercel --prod` promotes it to your production URL.

This is a quick way to view/share the rebranded prototype — it still calls the placeholder `api.bravoai.app` endpoint and won't have working Q&A, real data, or persistence (see `STRATEGY.md` §1 for what "not a demo" actually requires).

## Deploying the real Next.js app

The git repo is already connected to `https://github.com/JbravoI/Bravo-Ai.git`. Since the Next.js project lives in the `app/` subfolder (not the repo root), Vercel needs to know that:

1. Push to the connected GitHub repo.
2. In the Vercel dashboard: **New Project → Import** the repo.
3. **Before deploying**, set **Root Directory** to `app` in the project's settings (Vercel auto-detects Next.js once it looks in the right folder).
4. Add environment variables in **Project Settings → Environment Variables** — this is where `ANTHROPIC_API_KEY`, `DATABASE_URL` (your Postgres connection string), and any auth secrets will live once Epics 02-04 need them. These never go in the repo.
5. Every push to `main` auto-deploys to production; every PR gets its own preview URL for free — useful for testing each phase in isolation (see `test.md`) before merging.
6. Cloud cron (Epic 05's scheduled ingestion) uses **Vercel Cron Jobs**, configured via a `vercel.json` inside `app/` hitting `/api/scan` on a schedule.

This is buildable and deployable today (Epic 01 is complete) — it just isn't deployed yet. See `implementation/CURRENT_STATUS.md` for what's real once it is.
