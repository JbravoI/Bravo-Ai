# Bravo Ai — Deploying to Vercel

The Next.js app lives in the `app/` subfolder (not the repo root) — see the repo root restructuring (`app/` holds everything code-related, `Documentation/` holds everything else).

> The static `bravo-ai.html` prototype that used to offer a quick no-backend preview has been removed — the real Next.js app (Epic 01) fully supersedes it and is what you should deploy/preview from now on.

## Deploying the real Next.js app

The git repo is already connected to `https://github.com/JbravoI/Bravo-Ai.git`. Since the Next.js project lives in the `app/` subfolder, Vercel needs to know that:

1. Push to the connected GitHub repo.
2. In the Vercel dashboard: **New Project → Import** the repo.
3. **Before deploying**, set **Root Directory** to `app` in the project's settings (Vercel auto-detects Next.js once it looks in the right folder).
4. Add environment variables in **Project Settings → Environment Variables** — `MONGODB_URI` and `MONGODB_DB` (already required, see `app/.env.example`), plus `ANTHROPIC_API_KEY` and any auth secrets once Epics 03-04 need them. These never go in the repo. Atlas's Network Access list will also need to permit Vercel's deployment IPs.
5. Every push to `main` auto-deploys to production; every PR gets its own preview URL for free — useful for testing each phase in isolation (see `test.md`) before merging.
6. Cloud cron (Epic 05's scheduled ingestion) uses **Vercel Cron Jobs**, configured via a `vercel.json` inside `app/` hitting `/api/scan` on a schedule.

This is buildable and deployable today (Epic 01 is complete) — it just isn't deployed yet. See `implementation/CURRENT_STATUS.md` for what's real once it is.
